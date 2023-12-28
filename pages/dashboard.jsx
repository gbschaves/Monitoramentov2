import React, { useState, useEffect } from 'react';
import DashboardComponent from '@components/Dashboard/Dashboardcomponent';
import https from 'https';
import { Doughnut, Bar } from 'react-chartjs-2';
// Importe o Chart.js e suas escalas
import Chart from 'chart.js/auto';

import 'chart.js';
import 'chartjs-adapter-date-fns';

class Establishment {
  constructor(codestabelec, nomeEstabelecimento) {
    this.codestabelec = codestabelec;
    this.nomeEstabelecimento = nomeEstabelecimento;
    this.totalVendaDiaria = 0;
    this.media = 0;
  }
}

const DashboardPage = () => {
  const [estabelecimentosData, setEstabelecimentosData] = useState([]);
  const [totalVendaDiaria, setTotalVendaDiaria] = useState(0);
  const [totalMedia, setTotalMedia] = useState(0);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);

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
    const formatedNow = now.toDateString();
    const horaAtualFormatada = now.getHours();

    if (!establishmentMapTotalVenda.has(codestabelec)) {
      establishmentMapTotalVenda.set(codestabelec, new Establishment(codestabelec, estabelecimento));
    }

    const establishment = establishmentMapTotalVenda.get(codestabelec);

    if (isSameWeekday) {
      if (currentDate <= formatedNow) {
        if (horaAtualFormatada <= parseInt(hora)) {
          establishment.media += parseFloat(valor);
        }
      }
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

  useEffect(() => {
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
        accumulateTotals();
        
        console.log('Objetos finais:', processedDataTotalVenda);

        // Código para atualizar as opções do dropdown...
        const dropdownOptions = processedDataTotalVenda.map(item => ({
          value: item.codestabelec,
          label: item.nomeEstabelecimento,
        }));
        setDropdownOptions(dropdownOptions);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDropdownSelect = (selectedOption) => {
    console.log('Opção selecionada:', selectedOption);
  
    // Converta selectedOption para número
    const selectedEstab = estabelecimentosData.find(estab => estab.codestabelec === Number(selectedOption));
    console.log('Estabelecimento selecionado:', selectedEstab);
  
    if (!selectedEstab) {
      console.error(`Estabelecimento não encontrado para a opção selecionada: ${selectedOption}`);
    }
  
    setSelectedEstablishment(selectedEstab);
  };
  
  
  useEffect(() => {
    console.log('Dados do estabelecimento:', estabelecimentosData);
  }, [estabelecimentosData]);

  return (
    <DashboardComponent>
      <div style={{margin: '20px'}} className="dropdown">
        <select onChange={(e) => handleDropdownSelect(e.target.value)}>
          <option value="" disabled hidden>Selecione uma opção</option>
          {dropdownOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {selectedEstablishment && (
        <div style={{ display: 'flex', flexDirection: 'row' , margin: '20px'}}>
          <div style={{ flex: 1, marginTop: '25px'}}>
            <h2 style={{width: '10%'}}>{selectedEstablishment.nomeEstabelecimento}</h2>
              <p>Total Venda Diária: {selectedEstablishment.totalVendaDiaria.toFixed(2)}</p>
              <p>Média: {(selectedEstablishment.media / 8).toFixed(2)}</p>
          </div>
          <div style={{ flex: 1, marginTop: '50px'}}>
            {/* Gráfico Redondo (Velocímetro) */}
            <Doughnut
              data={{
                labels: ['Meta', 'Atual'],
                datasets: [{
                  data: [(selectedEstablishment.media / 8).toFixed(2), selectedEstablishment.totalVendaDiaria.toFixed(2)],
                  backgroundColor: ['#36A2EB', '#FFCE56'],
                }],
              }}
              width={100} // Ajuste manual do tamanho
              height={100}
            />
          </div>

          <div style={{ flex: 1, marginTop: '50px'}}>
            {/* Gráfico de Barras */}
            <Bar
              data={{
                labels: ['Meta', 'Atual'],
                datasets: [{
                  data: [(selectedEstablishment.media / 8).toFixed(2), selectedEstablishment.totalVendaDiaria.toFixed(2)],
                  backgroundColor: ['#36A2EB', '#FFCE56'],
                }],
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
              width={100} // Ajuste manual do tamanho
              height={100}
            />
          </div>
        </div>
      )}
    </DashboardComponent>
  );
};

export default DashboardPage;