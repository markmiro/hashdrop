import { useState } from "react";
import {
  cidToUrl,
  dataUrlToBlob,
  pinBlob,
  retrieveCidFromOtherServer,
  useEncrypter,
} from "../../util/dropUtils";
import axios from "axios";

export type DecrypterState =
  | "INITIAL"
  | "LOADING"
  | "DECRYPTING"
  | "DECRYPTED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "ERROR_PUBLISHING"
  | "CHECKING_AVAILABLE"
  | "AVAILABLE"
  | "NOT_AVAILABLE";

export function useDecrypter() {
  const [cid, setCid] = useState("");
  const [state, setState] = useState<DecrypterState>("INITIAL");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const encrypter = useEncrypter();

  async function decrypt(cid: string, privateCid: string) {
    setState("LOADING");
    const res = await axios.get(cidToUrl(privateCid));

    const downloadedEncrypted = res.data;
    setState("DECRYPTING");
    const dataUrl = await encrypter.decrypt(downloadedEncrypted, cid);
    setDataUrl(dataUrl);
    setState("DECRYPTED");
    setCid(cid);
  }

  async function publish() {
    if (!dataUrl || !cid) throw new Error("File not decrypted yet.");
    setState("PUBLISHING");
    const fob = await dataUrlToBlob(dataUrl);
    const remoteCid = await pinBlob(fob).catch(() =>
      setState("ERROR_PUBLISHING")
    );
    // This should never fail, but just in case
    if (cid !== remoteCid) {
      debugger;
      setState("ERROR_PUBLISHING");
      throw new Error("Uploaded file CID doesn't match the expected CID.");
    }

    // setState("PUBLISHED");

    setState("CHECKING_AVAILABLE");

    return retrieveCidFromOtherServer(cid)
      .then(() => {
        setState("AVAILABLE");
      })
      .catch(() => {
        setState("NOT_AVAILABLE");
      });
  }

  return { state, decrypt, publish, dataUrl };
}
