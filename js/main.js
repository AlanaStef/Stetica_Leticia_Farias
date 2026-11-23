/* ==========================================================================
   CONFIGURAÇÕES DO NEGÓCIO — altere apenas aqui
   ========================================================================== */
const configuracaoDoNegocio = {
  nomeDoNegocio: "Letícia Farias Estética",
  // Formato internacional, só números: 55 + DDD + número
  numeroWhatsapp: "5511983700128",
  // Mensagem já pronta quando a pessoa clica no botão de WhatsApp
  mensagemInicialDoWhatsapp:
    "Olá! Vi o site da Letícia Farias Estética e gostaria de saber mais sobre os procedimentos e valores. 😊",
  // Cole aqui a URL do app da Web do Google Apps Script (veja google-planilha/LEIA-ME.md).
  // Enquanto estiver vazia, os dados do formulário não são enviados a lugar nenhum.
  urlDoRegistroNaPlanilha:
    "https://script.google.com/macros/s/AKfycbxeevz3cxtcE5fKwo5pEabDYkDon6QcQK687CBXPRzL8bvdTPDNTvVNM5TUcpjID7Jo/exec",
};

/* ==========================================================================
   LINKS DE WHATSAPP (botão da página de contato)
   ========================================================================== */
function montarLinkWhatsapp(mensagem) {
  return `https://wa.me/${configuracaoDoNegocio.numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
}

function iniciarLinksDeWhatsapp() {
  document.querySelectorAll("[data-link-whatsapp]").forEach((link) => {
    link.href = montarLinkWhatsapp(configuracaoDoNegocio.mensagemInicialDoWhatsapp);
  });
}

/* ==========================================================================
   MENU MOBILE
   ========================================================================== */
function iniciarMenuMobile() {
  const botaoMenu = document.querySelector(".navbar__botao-menu");
  const listaMenu = document.querySelector(".navbar__lista");
  if (!botaoMenu || !listaMenu) return;

  botaoMenu.addEventListener("click", () => {
    const menuAberto = listaMenu.classList.toggle("navbar__lista--aberta");
    botaoMenu.setAttribute("aria-expanded", String(menuAberto));
  });
}

function fecharMenuMobile() {
  const botaoMenu = document.querySelector(".navbar__botao-menu");
  const listaMenu = document.querySelector(".navbar__lista");
  if (!botaoMenu || !listaMenu) return;

  listaMenu.classList.remove("navbar__lista--aberta");
  botaoMenu.setAttribute("aria-expanded", "false");
}

/* ==========================================================================
   NAVEGAÇÃO SEM RECARREGAR A PÁGINA (SPA)
   --------------------------------------------------------------------------
   Todas as "páginas" estão no index.html (.pagina). Os links usam #/nome.
   Ao navegar, o JS só mostra a página escolhida e esconde as outras;
   a navbar fica fixa e nada é recarregado. Funciona até abrindo o arquivo
   direto, sem servidor.
   ========================================================================== */
const PAGINA_PADRAO = "inicio";
const DURACAO_TRANSICAO_EM_MS = 180;

function lerPaginaDaUrl() {
  const identificador = window.location.hash.replace(/^#\/?/, "");
  const existe = document.getElementById(`pagina-${identificador}`);
  return existe ? identificador : PAGINA_PADRAO;
}

function marcarLinkAtivoNoMenu(identificador) {
  document.querySelectorAll(".navbar__link").forEach((link) => {
    if (link.getAttribute("href") === `#/${identificador}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let paginaVisivel = null;

function mostrarPagina(identificador) {
  if (identificador === paginaVisivel) return;

  const conteudo = document.getElementById("conteudo-principal");
  const paginaNova = document.getElementById(`pagina-${identificador}`);
  const paginaAntiga = paginaVisivel ? document.getElementById(`pagina-${paginaVisivel}`) : null;
  paginaVisivel = identificador;

  const trocar = () => {
    if (paginaAntiga) paginaAntiga.hidden = true;
    paginaNova.hidden = false;
    document.title = `${paginaNova.dataset.titulo} | ${configuracaoDoNegocio.nomeDoNegocio}`;
    window.scrollTo({ top: 0, behavior: "instant" });
    conteudo.classList.remove("conteudo-principal--trocando");
  };

  marcarLinkAtivoNoMenu(identificador);
  fecharMenuMobile();

  if (!paginaAntiga) {
    trocar();
    return;
  }
  conteudo.classList.add("conteudo-principal--trocando");
  setTimeout(trocar, DURACAO_TRANSICAO_EM_MS);
}

function iniciarNavegacaoSemRecarregar() {
  document.getElementById("conteudo-principal").classList.add("conteudo-principal");
  window.addEventListener("hashchange", () => mostrarPagina(lerPaginaDaUrl()));
  mostrarPagina(lerPaginaDaUrl());
}

/* ==========================================================================
   FORMULÁRIO DE CONTATO
   ========================================================================== */
function apenasDigitos(texto) {
  return texto.replace(/\D/g, "");
}

// Formata enquanto digita: (11) 98765-4321 ou (11) 3456-7890
function formatarCelular(texto) {
  const digitos = apenasDigitos(texto).slice(0, 11);
  if (digitos.length <= 2) return digitos ? `(${digitos}` : "";
  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);
  const separador = digitos.length > 10 ? 5 : 4;
  if (resto.length <= separador) return `(${ddd}) ${resto}`;
  return `(${ddd}) ${resto.slice(0, separador)}-${resto.slice(separador)}`;
}

function emailEhValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function registrarContatoNaPlanilha(dados) {
  const urlDaPlanilha = configuracaoDoNegocio.urlDoRegistroNaPlanilha;
  if (!urlDaPlanilha) return;

  // "text/plain" evita a checagem prévia (CORS) que o Google Apps Script não aceita.
  fetch(urlDaPlanilha, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(dados),
    keepalive: true,
  }).catch((erro) => console.warn("Não foi possível registrar o contato na planilha.", erro));
}

function iniciarFormularioDeContato() {
  const formulario = document.getElementById("formulario-contato");
  if (!formulario) return;

  const mensagemDeErro = document.getElementById("formulario-erro");
  const mensagemDeSucesso = document.getElementById("formulario-sucesso");

  formulario.celular.addEventListener("input", () => {
    formulario.celular.value = formatarCelular(formulario.celular.value);
  });

  function mostrarErro(texto) {
    mensagemDeSucesso.style.display = "none";
    mensagemDeErro.textContent = texto;
    mensagemDeErro.style.display = "block";
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const dados = {
      nome: formulario.nome.value.trim(),
      celular: formulario.celular.value.trim(),
      celularEhWhatsapp: formulario.celularWhatsapp.checked,
      email: formulario.email.value.trim(),
      endereco: formulario.endereco.value.trim(),
      servico: formulario.servico.value,
      observacoes: formulario.observacoes.value.trim(),
      campoArmadilha: formulario.website.value, // humanos não veem este campo; robôs preenchem
    };

    if (!dados.nome || !dados.endereco || !dados.servico) {
      return mostrarErro("Preencha nome, celular, endereço e escolha um serviço.");
    }
    const quantidadeDeDigitos = apenasDigitos(dados.celular).length;
    if (quantidadeDeDigitos < 10 || quantidadeDeDigitos > 11) {
      return mostrarErro("Informe o celular com DDD, por exemplo (11) 98765-4321.");
    }
    if (dados.email && !emailEhValido(dados.email)) {
      return mostrarErro("O e-mail informado parece incompleto. Confira ou deixe em branco.");
    }

    mensagemDeErro.style.display = "none";
    registrarContatoNaPlanilha(dados);
    mensagemDeSucesso.textContent = "Dados enviados! Entraremos em contato em breve.";
    mensagemDeSucesso.style.display = "block";
    formulario.reset();
  });
}

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  iniciarLinksDeWhatsapp();
  iniciarMenuMobile();
  iniciarFormularioDeContato();
  iniciarNavegacaoSemRecarregar();
});
