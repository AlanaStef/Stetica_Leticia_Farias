# Receber os contatos do site em uma planilha do Google

Cada vez que alguém enviar o formulário, uma linha nova aparece na planilha
(data e hora, nome, celular, se é WhatsApp, e-mail, endereço, serviço e observações).

## Passo a passo (uns 5 minutos, grátis)

1. Abra a planilha "Contatos - Letícia Farias Estética" no seu Google Drive (já criada, com o cabeçalho pronto). Se for refazer, crie uma nova e escreva os títulos das colunas na linha 1.
2. Na planilha: **Extensões > Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo do arquivo `Code.gs`. Salve (ícone de disquete).
4. Clique em **Implantar > Nova implantação**.
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar** e autorize quando o Google pedir
   (aparece um aviso de "app não verificado": **Avançado > Acessar (não seguro)**; o código é só o do arquivo acima).
6. Copie a **URL do app da Web** (termina em `/exec`).
7. No site, abra `js/main.js` e cole a URL em `urlDoRegistroNaPlanilha`:

       urlDoRegistroNaPlanilha: "https://script.google.com/macros/s/XXXX/exec",

8. Teste enviando o formulário. As respostas caem na primeira aba, abaixo do cabeçalho.

## Segurança
- A **URL que fica no site não dá acesso à planilha**: ela só aceita novos envios. Ler, apagar ou editar dados por ela não é possível.
- "Qualquer pessoa" na implantação significa que qualquer um pode *enviar* dados, não *abrir* a planilha. A planilha continua privada.
- Nunca compartilhe a planilha por "qualquer pessoa com o link". Compartilhe só com e-mails específicos.
- O script já descarta robôs simples (campo-armadilha), recusa envios sem nome/celular/endereço/serviço, corta textos longos e aceita no máximo 10 envios por minuto.
- Dica: use uma conta Google só da clínica e ative a verificação em duas etapas nela.

## Observações
- Se mudar o código do Apps Script depois, crie uma **nova versão** em Implantar > Gerenciar implantações.
- A planilha guarda nome, celular, e-mail e endereço de clientes: mantenha-a privada (compartilhe só com quem precisa) por causa da LGPD.
- Qualquer pessoa com a URL consegue enviar dados para a planilha; por isso o script só grava texto e nunca executa nada.
