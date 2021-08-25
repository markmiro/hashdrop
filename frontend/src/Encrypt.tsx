import { v4 as uuid } from "uuid";
import aes from "crypto-js/aes";
import { useEffect, useState } from "react";

const id = uuid();

export function Encrypt() {
  const [message, setMessage] = useState("Hello");
  const [enc, setEnc] = useState("");

  useEffect(() => {
    const enc = aes.encrypt(message, id).toString();
    setEnc(enc);
  }, [message]);

  return (
    <div>
      <div>
        <label className="db">PS</label>
        <input disabled readOnly className="w-100" value={id} />
      </div>
      <div>
        <label className="db">Message</label>
        <textarea
          className="w-100"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div>
        Encrypted:
        <div className="f7" style={{ wordBreak: "break-all" }}>
          {enc || "N/A"}
        </div>
      </div>
    </div>
  );
}
