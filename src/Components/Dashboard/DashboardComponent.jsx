// components/DashboardLayout.js
import React from 'react';
import Head from 'next/head';

const DashboardComponent= ({ children }) => {
  return (
    <div>
      <Head>
        <title>Seu Dashboard</title>
        {/* Adicione seus metadados e links para folhas de estilo (CSS) aqui */}
      </Head>
      <header>
        {/* Seu cabeçalho ou barra de navegação aqui */}
        <h1 style={{marginLeft: '20px'}}>Gráficos</h1>
      </header>
      <main>{children}</main>
      {/* Adicione seu rodapé aqui, se necessário */}
    </div>
  );
};

export default DashboardComponent;
