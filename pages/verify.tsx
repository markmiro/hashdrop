import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/Verify.module.css";
const Hash = require("ipfs-only-hash");

export default function Verify() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  function loadFile(e: any) {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result;
        console.log(contents);
        setText(contents);
        calcHash(contents);
      };
      reader.readAsText(files[0]);
    }
  }

  const calcHash = useCallback(async (text: string) => {
    setLoading(true);
    const ipfsTextHash = await Hash.of(text, { cidVersion: 1 });
    setHash(text ? ipfsTextHash : "");
    setLoading(false);
  }, []);

  function reset() {
    if (!fileRef.current) return;
    fileRef.current.type = "text";
    fileRef.current.type = "file";
    fileRef.current.setAttribute("value", "");
    setText("");
    setHash("");
  }

  useEffect(() => {
    if (!window.location.search) return;
    const isValid = window.location.search === "?hash=" + hash;
    setIsValid(isValid);
  }, [hash]);

  return (
    <div>
      <div className={styles.fileDrop}>
        <div>
          Drop a file here
          <br />
          <button>Open File</button>
        </div>
        <input
          className={styles.fileDropInput}
          type="file"
          ref={fileRef}
          onChange={loadFile}
        />
      </div>
      {text && hash && (
        <>
          <button onClick={reset}>Reset</button>
          {window.location.search && <div>{isValid ? "VALID" : "INVALID"}</div>}
          <pre className={styles.text}>{text}</pre>
          {hash}
          <iframe
            src={`https://${hash}.ipfs.dweb.link/`}
            width="100%"
            height="500px"
          />
        </>
      )}
    </div>
  );
}
