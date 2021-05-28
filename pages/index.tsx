import copy from "copy-to-clipboard";
import debounce from "lodash/debounce";
import { useCallback, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

const Hash = require("ipfs-only-hash");

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
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

  function reset() {
    if (!fileRef.current) return;
    fileRef.current.type = "text";
    fileRef.current.type = "file";
    fileRef.current.setAttribute("value", "");
    setText("");
    setHash("");
  }

  function updateText(text: string) {
    setLoading(true);
    setText(text);
    setHashDebounce(text);
  }

  function loadFile(e: any) {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result;
        console.log(contents);
        updateText(contents);
      };
      reader.readAsText(files[0]);
    }
  }

  return (
    <div>
      <label>
        Text input:
        <br />
        <textarea
          className={styles.textInput}
          value={text}
          onChange={(e) => updateText(e.target.value)}
        />
      </label>
      <a
        ref={dlRef}
        download="file.txt"
        href={"data:text/plain," + encodeURIComponent(text)}
      >
        Download File ⬇
      </a>{" "}
      <input type="file" ref={fileRef} onChange={loadFile} />{" "}
      <button onClick={reset}>Reset</button>
      <br />
      <br />
      <div>Hashed output:</div>
      <div className={styles.hashOutput} style={{ opacity: loading ? 0.7 : 1 }}>
        {text ? (
          <div>
            {!hash ? "Hashing..." : hash}{" "}
            <button
              onClick={() => {
                copy(hash);
                alert("Copied text");
              }}
            >
              Copy
            </button>
            <br />
            <br />
            <button
              className={styles.copyButton}
              onClick={() => {
                copy(`https://hashdrop.eth.link/verify/?hash=${hash}`);
                alert("Copied hash link");
              }}
            >
              Copy Link
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
