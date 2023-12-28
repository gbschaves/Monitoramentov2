import Head from 'next/head';
import Sidebar from 'src/Components/Sidebar/Sidebar';
import styles from './Layout.module.scss';

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Painel de monitoramento</title>
      </Head>
      <main className={styles.main}>
        <Sidebar />
        <section className={styles.content}>{children}</section>
      </main>
    </>
  );
};

export default Layout;
