import React, { useState, useEffect } from "react";
const https = require('https');
function reagruparJSON(dados) {
  const agrupado = {};

  dados.forEach((item) => {
    const hora = item.hora;
    const data = item.data;
    const codestabelec = item.codestabelec;
    const estabelecimento = item.estabelecimento;

    const periodoStart = Math.floor(parseInt(hora) / 4) * 4;
    const periodoEnd = periodoStart + 4;

    const periodo = `${periodoStart}h-${periodoEnd}h`;

    const chave = `${data}_${codestabelec}_${periodo}`;

    if (!agrupado[chave]) {
      agrupado[chave] = {
        data: data,
        codestabelec: codestabelec,
        periodo: periodo,
        total: 0,
        contagem: 0,
        estabelecimento: estabelecimento,
      };
    }

    agrupado[chave].total += parseFloat(item.valor);
    agrupado[chave].contagem++;
  });

  for (const chave in agrupado) {
    const item = agrupado[chave];
    item.media = item.total / item.contagem;
  }

  const resultado = Object.values(agrupado);
  return resultado;
}

const SpotsPage = () => {
  const [responses, setResponses] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [totalVendasPorEstabelecimento, setTotalVendasPorEstabelecimento] = useState({});

  useEffect(() => {
    const fazerRequisicoes = async () => {
      const results = [];
      const totalPorEstabelecimento = {};
  
      const hoje = new Date();
      const diaDaSemana = hoje.getDay() + 1;
      const diaAtual = `'${diaDaSemana}'`;
  
      const formattedDate = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
  
      try {
        var myHeaders = new Headers();
        myHeaders.append("cnpj", "28.165.341/0001-36");
        myHeaders.append("token", "462c2038-fe86-4d87-afcc-2aa1df420262");
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  
        // Remover as features problemáticas do cabeçalho Permissions-Policy
        myHeaders.append("Permissions-Policy", "geolocation=(), microphone=()");
  
        for (let i = 1; i <= 68; i++) {
          if (i === 2) {
            continue;
          }
  
          var urlencoded = new URLSearchParams();
          urlencoded.append("@codestabelec", i.toString());
          urlencoded.append("@dia", diaAtual);
  
          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow",
            agent: new https.Agent({ rejectUnauthorized: false }),
          };
  
          const response = await fetch(
            "http://localhost:8080/http://mercadominio.websac.net/v3/api/relatorio/32",
            requestOptions
          );
  
          const data = await response.text();
  
          try {
            const jsonData = JSON.parse(data);
            if (!Array.isArray(jsonData)) {
              const dataArray = Object.values(jsonData);
              const reagrupado = reagruparJSON(dataArray);
              results.push(...reagrupado);
            } else {
              const reagrupado = reagruparJSON(jsonData);
              results.push(...reagrupado);
            }
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        }
  
        results.forEach((item) => {
          const codEstabelecimento = item.codestabelec;
          const formattedCurrentDate = currentDate.padStart(2, '0');
  
          if (item.data === formattedCurrentDate) {
            if (!totalPorEstabelecimento[codEstabelecimento]) {
              totalPorEstabelecimento[codEstabelecimento] = {
                total: 0,
                contagem: 0,
              };
            }
  
            totalPorEstabelecimento[codEstabelecimento].total += item.total;
            totalPorEstabelecimento[codEstabelecimento].contagem++;
          }
        });
  
        for (const codEstabelecimento in totalPorEstabelecimento) {
          const item = totalPorEstabelecimento[codEstabelecimento];
          item.media = item.total / item.contagem;
        }
  
        setResponses(results);
        setTotalVendasPorEstabelecimento(totalPorEstabelecimento);
        setCurrentDate(formattedDate);
      } catch (error) {
        console.error("Erro ao fazer requisições:", error);
      }
    };
  
    fazerRequisicoes();
  
    const updateCurrentPeriod = () => {
      const now = new Date();
      const hora = now.getHours();
      const periodoStart = Math.floor(hora / 4) * 4;
      const periodoEnd = periodoStart + 4;
      const periodo = `${periodoStart}h-${periodoEnd}h`;
      setCurrentPeriod(periodo);
    };
  
    updateCurrentPeriod();
  
    const interval = setInterval(updateCurrentPeriod, 30 * 60 * 1000);
  
    return () => clearInterval(interval);
  }, []);
  

  const calcularPorcentagem = (vendaDiária, media) => {
    if (media === 0) return 0;
    return (vendaDiária / media) * 100;
  };

  const calendarFont = {
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "uppercase",
  };

  const clockFont = {
    fontFamily: "monospace",
    fontSize: "16px",
    fontWeight: "bold",
  };

  const spacedStyle = {
    margin: "2px 0",
  };

  function gerarTotal() {
    const formattedCurrentDate = currentDate.padStart(2, '0');
    let total = 0;
    responses.forEach((element) => {
      if (element.data === formattedCurrentDate) {
        total += element.total;
      }
    });

    return total;
  }

  function gerarMedia() {
    var dataDeHoje = new Date();
    var numeroDoDia = dataDeHoje.getDay();
    var diasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    var nomeDoDia = diasDaSemana[numeroDoDia];
    var media = 0;
    responses.forEach((element) => {
      var dataString = element.data
      var dataArray = new Date(dataString);
      var dataNome = dataArray.getDay();
      var nomeData = diasDaSemana[dataNome+1]
      if (nomeData === nomeDoDia) {
        media += element.total
      }
    });
    return media / 8
  }

  return (
    <div className="spots-page" style={{ width: "100%", padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "20px" }}>
        <div>
          <p style={calendarFont}>Data Atual: {currentDate}</p>
          <p style={clockFont}>Período Atual: {currentPeriod}</p>
        </div>
        <button
          className={`toggle-button ${showDetails ? "active" : ""}`}
          style={{ margin: "1rem" }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Ocultar Detalhes" : "Exibir Detalhes"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          Soma de Vendas do Dia: R$ {gerarTotal().toFixed(2)}
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          Média de Vendas: R$ {gerarMedia().toFixed(2)}
        </p>
      </div>

      <div className="grid-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px", justifyContent: "flex-start" }}>
        {responses
          .filter((response) => response.data === currentDate && response.periodo === currentPeriod)
          .map((response, index) => {
            const codEstabelecimento = response.codestabelec;
            const vendaDiaria = response.total;
            const media = responses
              .filter(
                (r) =>
                  r.codestabelec === response.codestabelec &&
                  r.data === currentDate
              )
              .reduce((total, r) => total + r.total, 0);
            const mediaCount = responses.filter(
              (r) =>
                r.codestabelec === response.codestabelec &&
                r.data === currentDate
            ).length;

            const porcentagem = calcularPorcentagem(vendaDiaria, media / mediaCount);
            const cor = porcentagem < 90 ? "#ff5656" : porcentagem > 90.1 && porcentagem < 95 ? "#ffd733" : porcentagem > 95 ? "#3fa8ff" : "#3fa8ff";
            const isMultipleWords = response.estabelecimento.split().length > 1;

            return (
              <div key={index} className={`grid-item ${isMultipleWords ? "multi-word" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    backgroundColor: cor,
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "white" }}>{porcentagem.toFixed(2)}%</div>
                </div>
                {showDetails ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: isMultipleWords ? "flex-end" : "center", ...spacedStyle }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>{response.estabelecimento}</p>
                    <p style={{ fontSize: "12px", ...spacedStyle }}>Venda Diária: R$ {vendaDiaria.toFixed(2)}</p>
                    <p style={{ fontSize: "12px", ...spacedStyle }}>Média: R$ {(media / mediaCount).toFixed(2)}</p>
                    <p style={{ fontSize: "12px", ...spacedStyle }}>
                      Total até o período atual: R${' '}
                      {responses
                        .filter(
                          (r) => 
                            r.codestabelec === codEstabelecimento &&
                            r.data === currentDate &&
                            parseInt(r.hora) <= new Date().getHours()
                        )
                        .reduce((total, r) => total + r.total, 0).toFixed(2) || 0}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>{response.estabelecimento}</p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SpotsPage;