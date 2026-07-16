# Raspadinha — Landinpage de Promoção

Um site de raspadinha digital para farmácias, com integração ao **Google Sheets** para coletar dados dos clientes de forma segura.

## 📋 Arquivos do Projeto

- **index.html** — Estrutura HTML
- **styles.css** — Estilos CSS
- **script.js** — Lógica da aplicação
- **config.public.js** — Configurações públicas (prêmios, código promocional)
- **config.secret.js** — Configurações secretas (WhatsApp, senha) — **não commitar no Git**
- **sheets-config.js** — Configuração do Google Sheets

## 🚀 Como Configurar o Google Sheets

### Passo 1: Criar uma Planilha

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em "Criar novo" → "Planilha em branco"
3. Renomeie para **"Raspadinha"**
4. Na primeira linha, coloque os headers:
   - **Coluna A:** Telefone
   - **Coluna B:** Prêmio
   - **Coluna C:** Código Promocional
   - **Coluna D:** Data/Hora
   - **Coluna E:** Email da Farmácia

### Passo 2: Criar o Google Apps Script

1. Abra [Google Apps Script](https://script.google.com)
2. Clique em "Novo projeto"
3. **Apague** o código padrão
4. **Cole** este código:

```javascript
function doPost(e) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheets()[0];

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.phone,
    data.premio,
    data.codigo,
    new Date().toLocaleString('pt-BR'),
    data.farmacia
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Dados salvos com sucesso!'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

5. Clique em **"Salvar"**
6. Clique em **"Deploy"** → **"New deployment"**
7. Selecione **"type: Web app"**
8. Em "Execute as", selecione **sua conta**
9. Em "Who has access", selecione **"Anyone"**
10. Clique em **"Deploy"**
11. **Copie a URL** gerada (algo como: `https://script.googleapis.com/macros/d/xxxxx/userweb`)

### Passo 3: Configurar no Site

1. Abra o arquivo **`sheets-config.js`**
2. Cole a URL copiada em `sheetsWebhookUrl`
3. Coloque o email/nome da farmácia em `farmaciaEmail`

**Exemplo:**
```javascript
const SHEETS_CONFIG = {
  sheetsWebhookUrl: "https://script.googleapis.com/macros/d/1abc2def3ghi4jkl5mno6pqr7stu8vwx/userweb",
  farmaciaEmail: "farmacia.xyz@email.com",
};
```

## ⚙️ Configurações Disponíveis

### config.public.js
- **premios** — Lista de prêmios sorteados
- **porcentagemParaRevelar** — % de raspa para revelar (0-100)
- **codigoPromocional** — Código fixo (deixe vazio para gerar automaticamente)

### config.secret.js
- **whatsappNumero** — Número do WhatsApp da farmácia (com DDI 55)
- **whatsappMensagem** — Mensagem pronta que aparece no WhatsApp
- **senhaAdmin** — Senha para acessar o painel (`?admin`)

## 🎮 Como Usar

### Cliente
1. Digita o **telefone**
2. Clica em **"Jogar"**
3. **Raspa** o cartão
4. Ao revelar, clica em **"Salvar imagem"** (opcional)
5. Clica em **"Falar no WhatsApp"** para contatar a farmácia

### Dono (Admin)
1. Acesse: `http://localhost:8000/?admin`
2. Digite a **senha** (padrão: `admin123`)
3. Veja o código promocional atual
4. Os dados dos clientes aparecem no **Google Sheets**, não no navegador

## 🔒 Segurança

- ✅ Senha do admin separada em `config.secret.js`
- ✅ Dados enviados para Google Sheets (não fica no navegador)
- ✅ `.gitignore` impede que `config.secret.js` seja commitado
- ✅ URL do Google Sheets em arquivo separado (`sheets-config.js`)

## 📦 Para Subir no Ar

1. **Configure** todas as informações em `config.public.js`, `config.secret.js` e `sheets-config.js`
2. **Não commite** `config.secret.js` (está no `.gitignore`)
3. Suba para **Vercel**, **Netlify** ou seu servidor
4. O site funciona como um arquivo estático — não precisa de backend

## 🔗 Links Úteis

- [Google Sheets](https://sheets.google.com)
- [Google Apps Script](https://script.google.com)
- [Vercel](https://vercel.com) — hospedagem gratuita
- [Netlify](https://netlify.com) — hospedagem gratuita

---

**Desenvolvido com ❤️ para farmácias**
