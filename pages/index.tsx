import copy from "copy-to-clipboard";
import debounce from "lodash/debounce";
import { useCallback, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

const Hash = require("ipfs-only-hash");

export default function Home() {
  const dlRef = useRef<HTMLAnchorElement>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");

  const setHashDebounce = useCallback(
    debounce(async (text: string) => {
      const ipfsTextHash = await Hash.of(text, { cidVersion: 1 });
      setHash(text ? ipfsTextHash : "");
      setLoading(false);
    }, 500),
    []
  );

  return (
    <div>
      <label>
        Text input:
        <br />
        <textarea
          className={styles.textInput}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setLoading(true);
            setHashDebounce(e.target.value);
          }}
        />
      </label>
      <br />
      <a
        ref={dlRef}
        download="file.txt"
        href={"data:text/plain," + encodeURIComponent(text)}
      >
        Download File
      </a>
      <br />
      <br />
      <div>Hashed output:</div>
      <div className={styles.hashOutput} style={{ opacity: loading ? 0.7 : 1 }}>
        {text ? (
          <div>
            {loading && !hash ? "Hashing..." : hash}
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
          Dropping hashes: an idiom used to demonstrate provenance of documents
        </a>
      </p>
    </div>
  );
}
