// components/SpotsPage.js
import React, { useState, useEffect } from 'react';
import SpotListItem from '../SpotListItem/SpotListItem';
import styles from '../../../styles/SpotsPage.module.scss';
import https from 'https';

class Establishment {
  constructor(codestabelec, nomeEstabelecimento) {
    this.codestabelec = codestabelec;
    this.nomeEstabelecimento = nomeEstabelecimento;
    this.totalVendaDiaria = 0;
    this.media = 0; // Adicionando o campo "media" com valor inicial 0
  }
}

const SpotsPage = () => {
  const [estabelecimentosData, setEstabelecimentosData] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [currentHour, setCurrentHour] = useState('');
  const [totalVendaDiaria, setTotalVendaDiaria] = useState(0);
  const [totalMedia, setTotalMedia] = useState(0);

  const getWeekday = (ano, mes, dia) => {
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const day = new Date(ano, mes - 1, dia);
    const today = new Date();
    const weekDay = day.getDay();
    const weekToday = today.getDay();
    return weekdays[weekDay] === weekdays[weekToday];
  };

  const accumulateTotalVendaDiaria = (establishmentMap, item) => {
    const { codestabelec, estabelecimento, valor } = item;

    if (!establishmentMap.has(codestabelec)) {
      establishmentMap.set(codestabelec, new Establishment(codestabelec, estabelecimento));
    }

    establishmentMap.get(codestabelec).totalVendaDiaria += parseFloat(valor);
  };

  const accumulateMedia = (establishmentMapTotalVenda, item) => {
    const { codestabelec, estabelecimento, valor, data, hora } = item;
  
    const [ano, mes, dia] = data.split('-');
    const isSameWeekday = getWeekday(ano, mes, dia);
    const curdate = new Date(data.split('-'));
    const currentDate = curdate.toDateString();
    const now = new Date();
    const formatedNow = now.toDateString()
    const horaAtualFormatada = now.getHours();
  
    // console.log(`Processando item: ${JSON.stringify(item)}`);
    // console.log(`Data Atual: ${currentDate}`);
    // console.log(`Agora: ${now}`);
    // console.log(`É o mesmo dia da semana: ${isSameWeekday}`);
    // console.log(`Hora do item: ${parseInt(hora)}`, typeof parseInt(hora));
    // console.log(`Hora atual: ${horaAtualFormatada}`, typeof horaAtualFormatada);
  
    if (!establishmentMapTotalVenda.has(codestabelec)) {
      // console.log(`Estabelecimento não encontrado em establishmentMapTotalVenda para codestabelec ${codestabelec}`);
      establishmentMapTotalVenda.set(codestabelec, new Establishment(codestabelec, estabelecimento));
    }
  
    const establishment = establishmentMapTotalVenda.get(codestabelec);
    // console.log(`Dados do estabelecimento: ${JSON.stringify(establishment)}`);
  
    if (isSameWeekday) {
      // console.log('É o mesmo dia da semana, verificando a hora...');
      if (currentDate <= formatedNow) {
        // console.log('Data é anterior ou igual à data atual, verificando a hora...');
        if (horaAtualFormatada <= parseInt(hora)) {
          establishment.media += parseFloat(valor);
          // console.log(`Acumulado valor para codestabelec ${codestabelec}`);
        } else {
          // console.log(`Não acumulado valor para codestabelec ${codestabelec} - Hora é posterior`);
        }
      } else {
        // console.log(`Não acumulado valor para codestabelec ${codestabelec} - Data é posterior`);
      }
    } else {
      // console.log(`Não acumulado valor para codestabelec ${codestabelec} - Não é o mesmo dia da semana`);
    }
  };

  const accumulateTotals = () => {
    let totalVendaDiariaValue = 0;
    let totalMediaValue = 0;

    estabelecimentosData.forEach(estabelecimento => {
      totalVendaDiariaValue += estabelecimento.totalVendaDiaria;
      totalMediaValue += estabelecimento.media;
    });

    setTotalVendaDiaria(totalVendaDiariaValue);
    setTotalMedia(totalMediaValue);
  };

  const fetchData = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("cnpj", "28.165.341/0001-36");
      myHeaders.append("token", "462c2038-fe86-4d87-afcc-2aa1df420262");
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Permissions-Policy", "geolocation=(), microphone=()");

      const hoje = new Date();
      const diaAtualFormatado = hoje.toISOString().split('T')[0];

      const diaDaSemana = hoje.getDay() + 1;
      const diaAtual = `'${diaDaSemana}'`;
      const timeZoneOffset = hoje.getTimezoneOffset() / 60;

      const urlencoded = new URLSearchParams({
        "@dia": diaAtual,
        "@timezoneOffset": timeZoneOffset,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
        agent: new https.Agent({ rejectUnauthorized: false }),
      };

      const response = await fetch("http://localhost:8080/http://mercadominio.websac.net/v3/api/relatorio/32", requestOptions);
      const result = await response.json();

      if (!Array.isArray(result)) {
        throw new Error('Invalid response format. Expected an array.');
      }

      const establishmentMapTotalVenda = new Map();
      const currentDateFormatted = hoje.toISOString().split('T')[0];
      const filteredResult = result.filter(item => item.data.includes(currentDateFormatted));

      filteredResult.forEach(item => {
        accumulateTotalVendaDiaria(establishmentMapTotalVenda, item);
      });

      result.forEach(item => {
        accumulateMedia(establishmentMapTotalVenda, item);
      });

      const processedDataTotalVenda = Array.from(establishmentMapTotalVenda.values()).map(estabelecimento => ({
        nomeEstabelecimento: estabelecimento.nomeEstabelecimento,
        codestabelec: estabelecimento.codestabelec,
        totalVendaDiaria: estabelecimento.totalVendaDiaria,
        media: estabelecimento.media,
      }));

      setEstabelecimentosData(processedDataTotalVenda);
      accumulateTotals(); // Chame a função para calcular os totais ao carregar os dados
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    const updateHour = () => {
      const now = new Date();
      const horaAtual = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setCurrentHour(horaAtual);
    };

    const interval = setInterval(() => {
      fetchData();
      accumulateTotals(); // Chame a função para calcular os totais a cada intervalo
    }, 300000);

    const intervalHour = setInterval(updateHour, 60000);

    updateHour();

    return () => {
      clearInterval(interval);
      clearInterval(intervalHour);
    };
  }, [estabelecimentosData]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const getColorForPercentage = percentage => {
    if (percentage < 90) {
      return "#ff5656";
    } else if (percentage >= 90 && percentage <= 95) {
      return "#ffd733";
    } else {
      return "#3fa8ff";
    }
  };

return (
  <div className={styles.spotsContainer}>
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleAndTime}>
          <h1>Situação dos Estabelecimentos</h1>
          <div className={styles.currentTime}>{currentHour}</div>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.totalInfo}>
            <div className={styles.totalItem}>
              <strong>Total Venda Diária:</strong> {totalVendaDiaria.toFixed(2)}
            </div>
            <div className={styles.totalItem}>
              <strong>Total Média:</strong> {totalMedia.toFixed(2)}
            </div>
          </div>
          <button onClick={toggleDetails} className={styles.toggleButton}>
            {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
          </button>
        </div>
      </div>
    </div>

    {estabelecimentosData.length > 0 ? (
      <ul>
        {estabelecimentosData
          .filter(estabelecimento => estabelecimento.codestabelec !== "2")
          .map(estabelecimento => (
            <SpotListItem
              key={estabelecimento.codestabelec}
              estabelecimento={estabelecimento}
              getColorForPercentage={getColorForPercentage}
              showDetails={showDetails}
            />
          ))}
      </ul>
    ) : (
      <p>Carregando dados dos estabelecimentos...</p>
    )}
  </div>
);

};

export default SpotsPage;
