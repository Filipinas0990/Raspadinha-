// Configuração do Supabase
const SUPABASE_CONFIG = {
  url: "https://qzeovkpggfaffbgkclck.supabase.co",
  key: "sb_publishable_VXKfB4yCncAZFY1zvtZPsQ_vOetimQx",
};

// Função para buscar todas as configurações do Supabase
async function obterConfiguracoes() {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/config?id=eq.1`,
      {
        headers: {
          "apikey": SUPABASE_CONFIG.key,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        return data[0];
      }
    }
  } catch (err) {
    console.error("Erro ao buscar configurações do Supabase:", err);
  }

  // Fallback
  return null;
}

// Função para buscar apenas o código promocional (compatibilidade)
async function obterCodigoPromo() {
  const config = await obterConfiguracoes();
  if (config?.codigo_promocional) {
    return config.codigo_promocional;
  }

  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  return mes + agora.getFullYear() + "-FP";
}

// Função para atualizar todas as configurações no Supabase
async function atualizarConfiguracoes(novoCode, novaPercentagem, novoNicho) {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/config?id=eq.1`,
      {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_CONFIG.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo_promocional: novoCode,
          porcentagem_promocao: parseInt(novaPercentagem),
          nicho_categoria: novoNicho,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (response.ok) {
      console.log("✓ Configurações atualizadas no Supabase!");
      return true;
    } else {
      console.error("✗ Erro ao atualizar configurações no Supabase");
      return false;
    }
  } catch (err) {
    console.error("Erro ao conectar com Supabase:", err);
    return false;
  }
}

// Função para atualizar apenas o código (compatibilidade)
async function atualizarCodigoPromo(novoCode) {
  const config = await obterConfiguracoes();
  return await atualizarConfiguracoes(
    novoCode,
    config?.porcentagem_promocao || 10,
    config?.nicho_categoria || "Geral"
  );
}
