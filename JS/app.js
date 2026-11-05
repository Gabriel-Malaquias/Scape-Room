const campoMensagem = document.getElementById("mensagem");
const botao = document.getElementById("btn-analisar");
const areaResultado = document.getElementById("resultado");
const textoVeredito = document.getElementById("veredito");
const textoPontuacao = document.getElementById("pontuacao");
const listaSinais = document.getElementById("sinais");

function mostrarResultado(resultado) {
  textoVeredito.textContent = resultado.veredito.texto;
  textoVeredito.className = "veredito " + resultado.veredito.classe;
  textoPontuacao.textContent = "Risco: " + resultado.pontos + " / 100";

  listaSinais.innerHTML = "";

  if (resultado.sinais.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Nenhum sinal encontrado. Isso não garante que seja seguro.";
    listaSinais.appendChild(item);
  }

  for (const sinal of resultado.sinais) {
    const item = document.createElement("li");

    const titulo = document.createElement("strong");
    titulo.textContent = sinal.titulo;

    const explicacao = document.createElement("span");
    explicacao.className = "explicacao";
    explicacao.textContent = sinal.explicacao;

    item.appendChild(titulo);
    item.appendChild(explicacao);
    listaSinais.appendChild(item);
  }

  areaResultado.classList.remove("hidden");
}

function executarAnalise() {
  const texto = campoMensagem.value.trim();

  if (texto === "") {
    alert("Cole uma mensagem primeiro.");
    return;
  }

  const resultado = analisarMensagem(texto);
  mostrarResultado(resultado);
}

botao.addEventListener("click", executarAnalise);

campoMensagem.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter" && !evento.shiftKey) {
    evento.preventDefault();
    executarAnalise();
  }
});

// VIGIA DO CAMPO VAZIO (agora com atraso de 10ms)
campoMensagem.addEventListener("input", function() {
  setTimeout(function() {
    if (campoMensagem.value.trim() === "") {
      areaResultado.classList.add("hidden");
    }
  }, 10);
});