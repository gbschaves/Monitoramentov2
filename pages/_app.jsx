import Layout from 'src/Layout/Layout'
import '../styles/globals.scss'


export default function MyApp({ Component, pageProps}) {
  return (
    <Layout> 
      <Component {...pageProps} />
    </Layout>
  )
}
