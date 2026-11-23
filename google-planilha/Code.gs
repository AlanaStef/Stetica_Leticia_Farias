/**
 * Recebe os dados do formulário do site e grava uma linha na planilha.
 * Cole este código em Extensões > Apps Script, dentro da planilha (veja LEIA-ME.md).
 *
 * Proteções: só aceita envio (não existe leitura pela URL), exige os campos principais,
 * limita o tamanho dos textos, descarta robôs (campo-armadilha) e limita envios por minuto.
 */
const NOME_DA_ABA_DE_CONTATOS = "Contatos";
const COLUNAS_DO_CABECALHO = ["Data e hora", "Nome", "Celular", "É WhatsApp", "E-mail", "Endereço", "Serviço", "Observações"];
const TAMANHO_MAXIMO_DO_TEXTO = 500;
const MAXIMO_DE_ENVIOS_POR_MINUTO = 10;

function doPost(evento) {
  const bloqueio = LockService.getScriptLock();
  bloqueio.waitLock(10000);

  try {
    const dadosDoContato = lerDadosDoEnvio(evento);

    if (!dadosDoContato) return responder(false);
    if (dadosDoContato.campoArmadilha) return responder(true); // robô: finge sucesso e descarta
    if (!dadosDoContato.nome || !dadosDoContato.celular || !dadosDoContato.endereco || !dadosDoContato.servico) return responder(false);
    if (excedeuLimiteDeEnviosPorMinuto()) return responder(false);

    obterOuCriarAbaDeContatos().appendRow([
      new Date(),
      protegerContraFormulaNaPlanilha(dadosDoContato.nome),
      protegerContraFormulaNaPlanilha(dadosDoContato.celular),
      dadosDoContato.celularEhWhatsapp ? "Sim" : "Não",
      protegerContraFormulaNaPlanilha(dadosDoContato.email),
      protegerContraFormulaNaPlanilha(dadosDoContato.endereco),
      protegerContraFormulaNaPlanilha(dadosDoContato.servico),
      protegerContraFormulaNaPlanilha(dadosDoContato.observacoes),
    ]);
    return responder(true);
  } finally {
    bloqueio.releaseLock();
  }
}

function lerDadosDoEnvio(evento) {
  try {
    return JSON.parse(evento.postData.contents);
  } catch (erro) {
    return null;
  }
}

function excedeuLimiteDeEnviosPorMinuto() {
  const memoria = CacheService.getScriptCache();
  const enviosNesteMinuto = Number(memoria.get("envios-no-minuto") || 0);
  if (enviosNesteMinuto >= MAXIMO_DE_ENVIOS_POR_MINUTO) return true;
  memoria.put("envios-no-minuto", String(enviosNesteMinuto + 1), 60);
  return false;
}

function responder(sucesso) {
  return ContentService
    .createTextOutput(JSON.stringify({ sucesso: sucesso }))
    .setMimeType(ContentService.MimeType.JSON);
}

function obterOuCriarAbaDeContatos() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_DA_ABA_DE_CONTATOS);

  // Planilha já criada com o cabeçalho na primeira aba: usa essa aba mesmo sem o nome "Contatos".
  const primeiraAba = planilha.getSheets()[0];
  if (!aba && primeiraAba.getRange("A1").getValue() === COLUNAS_DO_CABECALHO[0]) {
    aba = primeiraAba;
  }

  if (!aba) {
    aba = planilha.insertSheet(NOME_DA_ABA_DE_CONTATOS);
    aba.appendRow(COLUNAS_DO_CABECALHO);
    aba.getRange(1, 1, 1, COLUNAS_DO_CABECALHO.length).setFontWeight("bold");
    aba.setFrozenRows(1);
  }
  return aba;
}

// Textos que começam com = + - @ seriam interpretados como fórmula; o apóstrofo impede isso.
function protegerContraFormulaNaPlanilha(texto) {
  const textoLimpo = String(texto || "").slice(0, TAMANHO_MAXIMO_DO_TEXTO);
  return /^[=+\-@]/.test(textoLimpo) ? "'" + textoLimpo : textoLimpo;
}
