import aes from "crypto-js/aes";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { fobAsDataUrl } from "../util/fobAsDataUrl";
import styles from "../generic/styles.module.css";

const id = ethers.utils.hexlify(ethers.utils.randomBytes(12));

// https://stackoverflow.com/a/20285053
const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(fobAsDataUrl);

export function Encrypt() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("Hello");
  const [enc, setEnc] = useState("");

  useEffect(() => {
    const enc = aes.encrypt(message, id).toString();
    setEnc(enc);
  }, [message]);

  useEffect(() => {
    console.log(url);
    toDataURL(url).then((dataUrl) => {
      setMessage(dataUrl);
    });
  }, [url]);

  return (
    <div className={`flex flex-col gap-2 ${styles.body}`}>
      <label>ID</label>
      <input type="text" disabled readOnly value={id} />
      <label>URL</label>
      <input
        type="text"
        className="w-full"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex gap-1">
        <button
          className="btn-light"
          onClick={() => setUrl("./examples/file.txt")}
        >
          file.txt
        </button>
        <button
          className="btn-light"
          onClick={() => setUrl("./examples/bitcoin.pdf")}
        >
          bitcoin.pdf
        </button>
        <button
          className="btn-light"
          onClick={() => setUrl("./examples/molecule.svg")}
        >
          molecule.svg
        </button>
      </div>

      <label>Message</label>
      <textarea
        className="w-full"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="text-xs text-right opacity-60 font-mono">
        <div>Message length: {message.length}</div>
        <div>Encrypted length: {enc.length}</div>
        <div>
          Difference: {Math.round((enc.length / message.length) * 100)}%
        </div>
      </div>

      <iframe title="content" src={url} width="100%" className="border" />

      <label>Encrypted</label>
      <div className="px-6 py-2 bg-black bg-opacity-10 font-mono">
        <div className="border text-xs overflow-scroll break-all max-h-screen">
          {enc || "N/A"}
        </div>
      </div>
    </div>
  );
}
