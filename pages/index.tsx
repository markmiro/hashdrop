import sha512 from "crypto-js/sha512";
import copy from "copy-to-clipboard";
import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const config = {
  title: "hash💧",
  desc: "Prove that you owned a specific document at a specific time.",
};

export default function Home() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");

  useEffect(() => {
    const hashed = sha512(text).toString();
    setHash(hashed);
  }, [text]);

  return (
    <div>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.desc} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.pageWrapper}>
        <h1>{config.title}</h1>
        <label>
          Text input:
          <br />
          <textarea
            className={styles.textInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <br />
        <br />
        <div>Hashed output:</div>
        <div className={styles.hashOutput}>
          {text ? (
            <div>
              {hash}
              <br />
              <br />
              <button
                className={styles.copyButton}
                onClick={() => {
                  copy(hash);
                  alert("Copied text");
                }}
              >
                Copy
              </button>
            </div>
          ) : (
            <div className={styles.noHashOutput}>Type a message above ⤴</div>
          )}
        </div>
        <br />
        <hr />
        <p>
          <a href="https://www.kalzumeus.com/essays/dropping-hashes">
            Dropping hashes: an idiom used to demonstrate provenance of
            documents
          </a>
        </p>
      </main>
    </div>
  );
}
