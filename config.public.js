/* ============================================================
   CONFIGURAÇÕES PÚBLICAS
   Seguro commitar no Git
   ============================================================ */
const CONFIG_PUBLIC = {
  // Lista de prêmios possíveis (sorteados aleatoriamente)
  premios: [
    { texto: "10% de desconto" },
    { texto: "15% de desconto" },
    { texto: "Brinde surpresa" },
    { texto: "Frete grátis" },
  ],

  // Porcentagem que precisa ser raspada para revelar (0 a 100)
  porcentagemParaRevelar: 55,

  // Código promocional que aparece na raspadinha e vai na mensagem.
  // Deixe "" (vazio) para gerar automaticamente com o mês e ano atuais
  // + "-FP" no final (ex: "072026-FP").
  // Ou escreva aqui o código que VOCÊ escolher, ex: "JULHO26-FP".
  codigoPromocional: "",
};
