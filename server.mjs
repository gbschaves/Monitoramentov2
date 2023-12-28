import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import helmet from 'helmet';

const app = express();
const port = 5500;

// Configuração do CORS para permitir todas as origens
app.use(cors());

// Configuração do middleware CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://mercadominio.websac.net"],
    },
  })
);

// Função para fazer uma solicitação à API com base no código do estabelecimento
async function fetchDataByCodestabelec(codestabelec) {
  const url = "http://mercadominio.websac.net/v3/api/relatorio/32";
  console.log(`Enviando solicitação para codestabelec ${codestabelec}`);
  const urlencoded = new URLSearchParams();
  
  // Crie uma variável para armazenar a data atual
  const hoje = new Date();
  
  // Obtenha o dia da semana da data atual
  const diaDaSemana = hoje.getDay();
  
  // Armazene a variável
  const diaAtual = `'${diaDaSemana}'`;
  console(diaAtual)

  urlencoded.append("@codestabelec", codestabelec);
  urlencoded.append("@dia", diaAtual);
  
  const requestOptions = {
    method: "POST",
    headers: {
      "cnpj": "28.165.341/0001-36",
      "token": "462c2038-fe86-4d87-afcc-2aa1df420262",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": "PHPSESSID=srghstrp9q0pur5i7e5ufsmbd6"
    },
    body: urlencoded,
    redirect: "follow",
  };
  
  const response = await fetch(url, requestOptions);
  console.log(`Recebida resposta para codestabelec ${codestabelec}`);
  const data = await response.json();
  console.log(`Dados recebidos para codestabelec ${codestabelec}`);
  return data;
}

app.post('/api/dados', async (req, res) => {
  console.log("Iniciando rota /api/dados");
  const responseData = [];
  for (let codestabelec = 1; codestabelec <= 68; codestabelec++) {
    if (codestabelec !== 2) {
      const data = await fetchDataByCodestabelec(String(codestabelec));
      responseData.push(data);
      console.log(`Dados adicionados para codestabelec ${codestabelec}`);
    }
  }

  console.log("Enviando resposta");
  res.json(responseData);
});

app.listen(port, () => {
  console.log(`Servidor proxy rodando em http://localhost:${port}`);
});
