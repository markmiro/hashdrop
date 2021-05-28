import Head from "next/head";
import Link from "next/link";

import { config } from "../js/config";
import "../styles/globals.css";
import styles from "../styles/App.module.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.desc} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.pageWrapper}>
        <nav className={styles.nav}>
          <h1 className={styles.logo}>
            <Link href="/">{config.title}</Link>
          </h1>
          {/* <div>
            <Link href="/">
              <a>Drop</a>
            </Link>{" "}
            <Link href="/verify">
              <a>Verify</a>
            </Link>
          </div> */}
        </nav>
        <Component {...pageProps} />
      </main>
    </>
  );
}
export default MyApp;
