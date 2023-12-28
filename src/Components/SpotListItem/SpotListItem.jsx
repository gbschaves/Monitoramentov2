// components/SpotListItem.js
import React from 'react';
import styles from '../../../styles/SpotListItem.module.scss';

const SpotListItem = ({ estabelecimento, getColorForPercentage, showDetails }) => {
  const {
    nomeEstabelecimento,
    totalVendaDiaria,
    media,
    codestabelec,
  } = estabelecimento;

  const percentualRelativoMedia = (totalVendaDiaria / (media / 8)) * 100;

  return (
    <li className={styles.spotListItem} key={codestabelec}>
      <div
        className={styles.percentCircle}
        style={{ backgroundColor: getColorForPercentage(percentualRelativoMedia) }}
      >
        {percentualRelativoMedia.toFixed(2)}%
      </div>
      <p>Nome: {nomeEstabelecimento}</p>
      {showDetails && (
        <>
          <p>Total Venda Diária: R$ {totalVendaDiaria.toFixed(2)}</p>
          <p>Média de Vendas Diárias: R$ {(media / 8).toFixed(2)}</p>
          <p>Porcentagem em relação à Média: {percentualRelativoMedia.toFixed(2)}%</p>
        </>
      )}
    </li>
  );
};

export default SpotListItem;
