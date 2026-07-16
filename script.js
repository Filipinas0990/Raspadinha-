// CONFIG é mesclado de config.public.js + config.secret.js
const CONFIG = { ...CONFIG_PUBLIC, ...CONFIG_SECRET };

const card        = document.getElementById("card");
const canvas      = document.getElementById("scratchCanvas");
const ctx         = canvas.getContext("2d");
const form        = document.getElementById("playForm");
const phoneInput  = document.getElementById("phone");
const playBtn     = document.getElementById("playBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const msg         = document.getElementById("msg");
const hint        = document.getElementById("hint");
const prizeText   = document.getElementById("prizeText");
const prizeCode   = document.getElementById("prizeCode");
const saveBtn     = document.getElementById("saveBtn");
const mainPage    = document.querySelector(".container");
const loginPage   = document.getElementById("loginPage");
const adminPage   = document.getElementById("adminPage");
const loginInput  = document.getElementById("loginInput");
const loginBtn    = document.getElementById("loginBtn");
const loginError  = document.getElementById("loginError");
const adminPercentualInput = document.getElementById("adminPercentualInput");
const adminNichoInput = document.getElementById("adminNichoInput");
const adminCodeInput = document.getElementById("adminCodeInput");
const adminSaveAllBtn = document.getElementById("adminSaveAllBtn");
const adminBackBtn = document.getElementById("adminBackBtn");
const adminClearBtn = document.getElementById("adminClearBtn");
const cadastrosList = document.getElementById("cadastrosList");
const currentPercentualDisplay = document.getElementById("currentPercentual");
const currentNichoDisplay = document.getElementById("currentNicho");
const currentCodeDisplay = document.getElementById("currentCode");
const totalCadastrosDisplay = document.getElementById("totalCadastros");

// Cache das configurações
let configCache = null;

let unlocked = false;
let revealed = false;
let premioSorteado = null;

// Código promocional: busca do Supabase
let codigoPromoCache = null;

async function carregarCodigoPromo() {
  codigoPromoCache = await obterCodigoPromo();
  return codigoPromoCache;
}

function getCodigoPromo() {
  return codigoPromoCache || "072026-FP";
}

// ---------- Desenha a camada "prateada" da raspadinha ----------
function setupCanvas() {
  const area = document.getElementById("scratchArea");
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = area.clientWidth * dpr;
  canvas.height = area.clientHeight * dpr;
  canvas.style.width  = area.clientWidth + "px";
  canvas.style.height = area.clientHeight + "px";
  ctx.scale(dpr, dpr);

  const w = area.clientWidth, h = area.clientHeight;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0,   "#cfc3cc");
  grad.addColorStop(0.5, "#b7a9b4");
  grad.addColorStop(1,   "#d8ccd5");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // ruído leve para parecer metal de raspadinha
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = "rgba(255,255,255," + (Math.random() * 0.08) + ")";
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }

  ctx.fillStyle = "#8a7d87";
  ctx.font = "600 15px Poppins, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Raspe aqui ✨", w / 2, h / 2);
}

// ---------- Raspagem ----------
let scratching = false;

function scratchAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function scratchedPercent() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let clear = 0;
  // amostra 1 a cada 16 pixels para ficar rápido
  for (let i = 3; i < data.length; i += 64) {
    if (data[i] === 0) clear++;
  }
  return (clear / (data.length / 64)) * 100;
}

function reveal() {
  if (revealed) return;
  revealed = true;
  canvas.style.transition = "opacity 0.5s";
  canvas.style.opacity = "0";
  setTimeout(() => (canvas.style.display = "none"), 500);

  hint.textContent = "🎉 Parabéns! Clique no botão verde para resgatar seu prêmio.";
  playBtn.style.display = "none";
  saveBtn.style.display = "flex";
  whatsappBtn.style.display = "flex";

  // envia dados para Formspree
  enviarParaFormspree({
    phone: phoneInput.value.trim(),
    premio: premioSorteado.texto,
    codigo: getCodigoPromo(),
  });

  // guarda que este navegador já jogou (para bloquear re-jogo - LOCAL)
  localStorage.setItem("raspadinha_jogou", JSON.stringify({
    phone: phoneInput.value.trim(),
    premio: premioSorteado.texto,
    codigo: getCodigoPromo(),
    data: new Date().toISOString(),
  }));

  setMsg("Prêmio revelado: " + premioSorteado.texto + " (código " + getCodigoPromo() + ")!", "success");
}

function onPointerDown(e) {
  if (!unlocked || revealed) return;
  scratching = true;
  canvas.setPointerCapture(e.pointerId);
  scratchAt(e.clientX, e.clientY);
}

function onPointerMove(e) {
  if (!scratching || revealed) return;
  scratchAt(e.clientX, e.clientY);
  if (scratchedPercent() >= CONFIG.porcentagemParaRevelar) reveal();
}

function onPointerUp() { scratching = false; }

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);

// ---------- Formulário ----------
function setMsg(text, type) {
  msg.textContent = text;
  msg.className = "msg " + (type || "");
}

function sortearPremio() {
  const i = Math.floor(Math.random() * CONFIG.premios.length);
  return CONFIG.premios[i];
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const phone = phoneInput.value.trim();

  if (!/^\d{10,}$/.test(phone)) {
    setMsg("Digite um telefone válido (mínimo 10 dígitos).", "error");
    return;
  }

  // já jogou neste navegador?
  const anterior = localStorage.getItem("raspadinha_jogou");
  if (anterior) {
    const dados = JSON.parse(anterior);
    const codigoAntigo = dados.codigo || getCodigoPromo();
    setMsg("Você já raspou! Seu prêmio foi: " + dados.premio + " (código " + codigoAntigo + ").", "error");
    playBtn.style.display = "none";
    whatsappBtn.style.display = "flex";
    montarLinkWhatsapp(dados.premio, codigoAntigo);
    return;
  }

  // libera a raspadinha
  unlocked = true;
  premioSorteado = sortearPremio();
  prizeText.textContent = "🎁 " + premioSorteado.texto;
  prizeCode.textContent = getCodigoPromo();
  montarLinkWhatsapp(premioSorteado.texto, getCodigoPromo());

  card.classList.remove("locked");
  phoneInput.disabled = true;
  playBtn.disabled = true;
  playBtn.style.opacity = "0.6";
  hint.textContent = "Agora raspe o cartão com o dedo ou o mouse! 👆";
  setMsg("Boa sorte! Raspe o cartão ao lado.", "success");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
});

function montarLinkWhatsapp(premio, codigo) {
  const texto = encodeURIComponent(
    CONFIG.whatsappMensagem + premio + " — Código promocional: " + codigo
  );
  whatsappBtn.href = "https://wa.me/" + CONFIG.whatsappNumero + "?text=" + texto;
}

saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  saveBtn.textContent = "Salvando...";
  try {
    const image = await html2canvas(document.getElementById("scratchArea"));
    const link = document.createElement("a");
    link.href = image.toDataURL();
    link.download = "raspadinha-" + new Date().getTime() + ".png";
    link.click();
    setMsg("Imagem salva com sucesso!", "success");
  } catch (err) {
    setMsg("Erro ao salvar imagem. Tente de novo.", "error");
  }
  saveBtn.disabled = false;
  saveBtn.textContent = "Salvar imagem";
});

// ---------- Formspree ----------
function enviarParaFormspree(dados) {
  if (!FORMSPREE_CONFIG.formUrl || FORMSPREE_CONFIG.formUrl.includes("seu-id")) {
    console.warn("Formspree não configurado. Dados não foram salvos.");
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = FORMSPREE_CONFIG.formUrl;
  form.target = "formspree";

  const campos = {
    telefone: dados.phone,
    premio: dados.premio,
    codigo: dados.codigo,
    data: new Date().toLocaleString("pt-BR"),
  };

  for (const [name, value] of Object.entries(campos)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();

  console.log("✓ Dados enviados para Formspree com sucesso!");
}

// ---------- Admin ----------
async function carregarAdmin() {
  // Busca as configurações do Supabase
  configCache = await obterConfiguracoes();

  if (configCache) {
    currentPercentualDisplay.textContent = configCache.porcentagem_promocao || 10;
    currentNichoDisplay.textContent = configCache.nicho_categoria || "Geral";
    currentCodeDisplay.textContent = configCache.codigo_promocional || "-";

    adminPercentualInput.value = configCache.porcentagem_promocao || 10;
    adminNichoInput.value = configCache.nicho_categoria || "Geral";
    adminCodeInput.value = configCache.codigo_promocional || "";
  } else {
    currentPercentualDisplay.textContent = "10";
    currentNichoDisplay.textContent = "Geral";
    currentCodeDisplay.textContent = "-";
  }

  cadastrosList.innerHTML = '';
  cadastrosList.innerHTML = `
    <div class="cadastro-vazio">
      <strong>📊 Dados salvos no Formspree</strong><br>
      <p style="margin-top: 12px; opacity: 0.9;">
        Os telefones e prêmios são coletados automaticamente via Formspree.
      </p>
      <p style="margin-top: 12px; opacity: 0.8; font-size: 0.85rem;">
        <strong>Acesse as submissões:</strong><br>
        Abra: <a href="https://formspree.io/f/xgogoavd" target="_blank" style="color: #b6f5c9;">Formspree Dashboard</a>
      </p>
      <p style="margin-top: 12px; opacity: 0.7; font-size: 0.8rem;">
        Para integrar com Google Sheets, configure um webhook no Formspree.
      </p>
    </div>
  `;
}

function mostrarLoginAdmin() {
  mainPage.style.display = "none";
  loginPage.classList.add("active");
  loginInput.value = "";
  loginError.textContent = "";
  loginInput.focus();
}

function mostrarAdmin() {
  loginPage.classList.remove("active");
  adminPage.classList.add("active");
  carregarAdmin();
}

function voltarDoAdmin() {
  mainPage.style.display = "flex";
  adminPage.classList.remove("active");
  loginPage.classList.remove("active");
}

loginBtn.addEventListener("click", () => {
  const senha = loginInput.value;
  if (senha === CONFIG.senhaAdmin) {
    mostrarAdmin();
  } else {
    loginError.textContent = "Senha incorreta.";
    loginInput.value = "";
  }
});

loginInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

adminSaveAllBtn.addEventListener("click", async () => {
  const novoCode = adminCodeInput.value.trim();
  const novaPercentagem = adminPercentualInput.value.trim();
  const novoNicho = adminNichoInput.value;

  if (!novoCode) {
    alert("Digite um código promocional.");
    return;
  }

  if (!novaPercentagem || parseInt(novaPercentagem) < 0 || parseInt(novaPercentagem) > 100) {
    alert("Digite um percentual válido (0-100).");
    return;
  }

  adminSaveAllBtn.disabled = true;
  adminSaveAllBtn.textContent = "Salvando...";

  const sucesso = await atualizarConfiguracoes(novoCode, novaPercentagem, novoNicho);

  if (sucesso) {
    codigoPromoCache = novoCode;
    configCache = { codigo_promocional: novoCode, porcentagem_promocao: parseInt(novaPercentagem), nicho_categoria: novoNicho };

    currentPercentualDisplay.textContent = novaPercentagem;
    currentNichoDisplay.textContent = novoNicho;
    currentCodeDisplay.textContent = novoCode;

    alert("✓ Todas as configurações foram atualizadas!\n\n" +
          "Percentual: " + novaPercentagem + "%\n" +
          "Nicho: " + novoNicho + "\n" +
          "Código: " + novoCode + "\n\n" +
          "Próximos clientes verão as mudanças automaticamente!");
  } else {
    alert("✗ Erro ao atualizar configurações. Tente novamente.");
  }

  adminSaveAllBtn.disabled = false;
  adminSaveAllBtn.textContent = "💾 Salvar Todas as Configurações";
});

adminBackBtn.addEventListener("click", voltarDoAdmin);

adminClearBtn.addEventListener("click", () => {
  alert("Os dados estão salvos no Google Sheets.\n\nPara deletar registros, acesse sua planilha diretamente em sheets.google.com e apague as linhas que desejar.");
});

// ---------- Inicialização ----------
const params = new URLSearchParams(location.search);

// Modo teste: abra com "?reset"
if (params.has("reset")) {
  localStorage.removeItem("raspadinha_jogou");
  setMsg("Registro apagado — você pode jogar de novo. (modo teste)", "success");
}

// Modo admin: abra com "?admin"
if (params.has("admin")) {
  mostrarLoginAdmin();
}

// Carrega o código promocional do Supabase
carregarCodigoPromo().then(() => {
  console.log("✓ Código promocional carregado:", getCodigoPromo());
}).catch(err => {
  console.error("Erro ao carregar código promocional:", err);
});

setupCanvas();
