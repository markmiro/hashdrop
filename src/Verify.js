import queryString from "query-string";
import { useCallback, useEffect, useRef, useState } from "react";
import Helmet from "react-helmet";
import { config } from "./config";
import styles from "./Verify.module.css";
const Hash = require("ipfs-only-hash");

function getQueryStringHash() {
  if (!window.location.search) return "";
  const { hash } = queryString.parse(window.location.search);
  if (typeof hash !== "string") return "";
  return hash;
}

function hashToUrl(hash) {
  return `https://${hash}.ipfs.dweb.link`;
}

export default function Verify() {
  const fileRef = useRef(null);
  const [hasLocationSearch, setHasLocationSearch] = useState(false);
  const [text, setText] = useState("");
  const [wantedHash, setWantedHash] = useState("");
  const [hash, setHash] = useState("");
  const [hashFound, setHashFound] = useState(false);
  const [wantedHashFound, setWantedHashFound] = useState(false);

  const checkWantedHash = useCallback(
    async (wantedHash) => {
      try {
        await fetch(hashToUrl(wantedHash));
        setWantedHashFound(true);
      } catch (err) {
        setWantedHashFound(false);
      }
    },
    [wantedHash]
  );

  useEffect(() => {
    setWantedHash(getQueryStringHash());
    if (window.location.search) setHasLocationSearch(true);
  }, []);

  useEffect(() => {
    checkWantedHash(wantedHash);
  }, [wantedHash]);

  const calcHash = useCallback(async (text) => {
    setHashFound(false);
    setHash("");
    const ipfsTextHash = await Hash.of(text, { cidVersion: 1 });
    setHash(text ? ipfsTextHash : "");
    try {
      await fetch(hashToUrl(ipfsTextHash));
      setHashFound(true);
    } catch (err) {
      setHashFound(false);
    }
  }, []);

  function loadFile(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result;
        console.log(contents);
        setText(contents);
        calcHash(contents);
        // alert(files[0].name);
      };
      reader.readAsText(files[0]);
    }
  }

  function reset() {
    if (fileRef.current) {
      fileRef.current.type = "text";
      fileRef.current.type = "file";
      fileRef.current.setAttribute("value", "");
    }
    setText("");
    setHash("");
    setHashFound(false);
  }

  const isValid = wantedHash && hash === wantedHash;

  return (
    <div>
      <Helmet>
        <title>Verify | {config.title}</title>
      </Helmet>
      <label>
        Expected hash:
        <input
          className={styles.textInput}
          placeholder="Paste in expected hash"
          value={wantedHash}
          onChange={(e) => setWantedHash(e.target.value)}
          autoCorrect="off"
          autoCapitalize="off"
          autoFocus
          disabled={hasLocationSearch}
        />
      </label>
      {wantedHash && (
        <>
          {wantedHashFound ? (
            <>
              From IPFS:
              <iframe src={hashToUrl(wantedHash)} width="100%" height="500px" />
            </>
          ) : (
            <div className={styles.warningBox}>
              File for hash not published, or file published but cannot be
              found.
              <p>
                If you're the one who created the hash above, publish the file
                using something like <a href="https://pinata.cloud/">Pinata</a>{" "}
                once you're ready to share your secret message with the world.
              </p>
            </div>
          )}
        </>
      )}
      <br />
      <br />
      {text && hash ? (
        <>
          {isValid ? (
            <div className={styles.successBox}>
              <button onClick={reset}>← Choose another file</button>
              <h1>✅ Perfect Match</h1>
              Dropped file hash: {hash}
            </div>
          ) : (
            <div className={styles.actualFileArea}>
              <div className={styles.errorBox}>
                <button onClick={reset}>← Back</button>
                <h1>❌ Hash Mismatch</h1>
                <pre style={{ textAlign: "left" }}>
                  Wanted: {wantedHash}
                  <br />
                  Actual: {hash}
                </pre>
              </div>
              <br />
              Contents:
              <pre className={styles.text}>{text}</pre>
              <br />
              {hashFound ? (
                <>
                  From IPFS:
                  <iframe src={hashToUrl(hash)} width="100%" height="500px" />
                </>
              ) : (
                <div className={styles.errorBox}>
                  File for hash not published, or file published but cannot be
                  found. Considering pinning the file using something like{" "}
                  <a href="https://pinata.cloud/">Pinata</a>.
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={styles.fileDrop}>
          <div>
            Drop a file here to check against expected hash.
            <br />
            <br />
            <button>Choose File</button>
          </div>
          <input
            className={styles.fileDropInput}
            type="file"
            ref={fileRef}
            onChange={loadFile}
          />
        </div>
      )}
    </div>
  );
}
