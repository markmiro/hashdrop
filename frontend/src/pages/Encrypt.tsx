import { v4 as uuid } from "uuid";
import aes from "crypto-js/aes";
import { useEffect, useState } from "react";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";

const id = uuid();

// https://stackoverflow.com/a/20285053
const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(fileOrBlobAsDataUrl);

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
    <div>
      <div>
        <label className="db">PS</label>
        <input disabled readOnly className="w-100" value={id} />
      </div>
      <div>
        <label className="db">URL</label>
        <input
          className="w-100"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={() => setUrl("./examples/file.txt")}>file.txt</button>
        <button onClick={() => setUrl("./examples/bitcoin.pdf")}>
          bitcoin.pdf
        </button>
        <button onClick={() => setUrl("./examples/molecule.svg")}>
          molecule.svg
        </button>
      </div>
      <div>
        <label className="db">Message</label>
        <textarea
          className="w-100"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="f7 tr o-60">Message length: {message.length}</div>
      <div className="f7 tr o-60">Encrypted length: {enc.length}</div>
      <div className="f7 tr o-60">
        Difference: {Math.round((enc.length / message.length) * 100)}%
      </div>
      <iframe src={url} width="100%" />
      <div>
        Encrypted
        <div
          className="f7 h4 overflow-scroll ba"
          style={{ wordBreak: "break-all" }}
        >
          {enc || "N/A"}
        </div>
      </div>
    </div>
  );
}
