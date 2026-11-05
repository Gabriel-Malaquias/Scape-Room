// ===== REGRAS POR PALAVRAS =====
const REGRAS_PALAVRAS = [
  {
    nome: "Linguagem de urgência",
    explicacao: "Golpistas criam pressa para você agir sem pensar.",
    pontos: 25,
    palavras: ["urgente", "imediatamente", "últimas horas", "bloqueada",
               "bloqueado", "expira", "agora", "suspenso", "último aviso"]
  },
  {
    nome: "Pedido de dados sensíveis",
    explicacao: "Empresas sérias não pedem senha, código ou token por mensagem.",
    pontos: 25,
    palavras: ["senha", "código de verificação", "código enviado", "token",
               "cpf", "cartão", "cvv", "confirme seus dados", "atualize seus dados"]
  },
  {
    nome: "Menção a dinheiro ou PIX",
    explicacao: "Golpes financeiros quase sempre envolvem pagamento, prêmio ou transferência.",
    pontos: 15,
    palavras: ["pix", "transferência", "depósito", "prêmio", "você ganhou",
               "reembolso", "taxa", "boleto"]
  }
];

// ===== LISTAS PARA ANÁLISE DE LINKS =====
const ENCURTADORES = ["bit.ly", "tinyurl.com", "t.co", "goo.gl",
                      "cutt.ly", "is.gd", "rb.gy", "shorturl.at"];

const TERMINACOES_SUSPEITAS = [".xyz", ".top", ".click", ".club",
                               ".online", ".site", ".icu", ".buzz"];

// ===== FUNÇÕES AUXILIARES =====
function extrairLinks(texto) {
  const padrao = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const encontrados = texto.match(padrao) || [];
  const limpos = [];
  for (const link of encontrados) {
    limpos.push(link.replace(/[.,;!?)]+$/, ""));
  }
  return limpos;
}

function pegarDominio(link) {
  const semProtocolo = link.replace(/^https?:\/\//i, "");
  return semProtocolo.split(/[\/?#:]/)[0].toLowerCase();
}

function ehEnderecoIP(dominio) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(dominio);
}

function temTerminacaoSuspeita(dominio) {
  for (const terminacao of TERMINACOES_SUSPEITAS) {
    if (dominio.endsWith(terminacao)) {
      return true;
    }
  }
  return false;
}

function definirVeredito(pontos) {
  if (pontos >= 50) {
    return { texto: "🚨 Alto risco de golpe", classe: "alto" };
  }
  if (pontos >= 25) {
    return { texto: "⚠️ Mensagem suspeita", classe: "medio" };
  }
  return { texto: "✅ Poucos sinais de golpe", classe: "baixo" };
}

// ===== FUNÇÃO PRINCIPAL =====
function analisarMensagem(texto) {
  const textoMinusculo = texto.toLowerCase();
  const sinais = [];
  let pontos = 0;

  // Parte 1: regras por palavras
  for (const regra of REGRAS_PALAVRAS) {
    const encontradas = [];
    for (const palavra of regra.palavras) {
      if (textoMinusculo.includes(palavra)) {
        encontradas.push(palavra);
      }
    }
    if (encontradas.length > 0) {
      sinais.push({
        titulo: regra.nome + ": " + encontradas.join(", "),
        explicacao: regra.explicacao
      });
      pontos += regra.pontos;
    }
  }

  // Parte 2: regras de links
  for (const link of extrairLinks(texto)) {
    const dominio = pegarDominio(link);

    if (link.toLowerCase().startsWith("http://")) {
      sinais.push({
        titulo: "Link sem HTTPS: " + dominio,
        explicacao: "A conexão não é criptografada. Sites sérios de banco e loja usam HTTPS."
      });
      pontos += 10;
    }

    if (ENCURTADORES.includes(dominio)) {
      sinais.push({
        titulo: "Link encurtado: " + dominio,
        explicacao: "Encurtadores escondem o destino real do link."
      });
      pontos += 15;
    }

    if (ehEnderecoIP(dominio)) {
      sinais.push({
        titulo: "Link com endereço IP: " + dominio,
        explicacao: "Sites legítimos usam nome, não um número de IP."
      });
      pontos += 30;
    }

    if (temTerminacaoSuspeita(dominio)) {
      sinais.push({
        titulo: "Terminação de domínio suspeita: " + dominio,
        explicacao: "Essas terminações são baratas e muito usadas em golpes."
      });
      pontos += 15;
    }
  }

  if (pontos > 100) {
    pontos = 100;
  }

  return {
    pontos: pontos,
    sinais: sinais,
    veredito: definirVeredito(pontos)
  };
}