import { useState } from "react";
import { cidToUrl, pinFile } from "../../util/pinata";
import { decryptFileString } from "../../util/encrypt";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";
import { base64ToBlob } from "base64-blob";
import axios from "axios";
import { fobAsText } from "../../util/fobAsText";
import { textToBlob } from "../../util/textToBlob";
import { ipfsCid } from "../../util/ipfsCid";

export type DecrypterState =
  | "INITIAL"
  | "LOADING"
  | "DECRYPTING"
  | "DECRYPTED"
  | "PUBLISHING"
  | "VERIFYING"
  | "PUBLISHED"
  | "ERROR";

export function useDecrypter() {
  const provider = useEthersProvider();
  const [cid, setCid] = useState("");
  const [state, setState] = useState<DecrypterState>("INITIAL");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  async function decrypt(cid: string, privateCid: string) {
    setState("LOADING");
    const res = await axios.get(cidToUrl(privateCid));
    if (res.status === 404) {
      throw new Error("Not found");
    }
    const encrypted = await res.data;
    setState("DECRYPTING");
    const signer = provider.getSigner();
    const ps = await signer.signMessage(cid);
    const dataUrl = await decryptFileString(encrypted, ps);
    setDataUrl(dataUrl);
    setState("DECRYPTED");
    setCid(cid);
  }

  async function publish() {
    if (!dataUrl || !cid) throw new Error("File not decrypted yet.");
    setState("PUBLISHING");
    const fob = await base64ToBlob(dataUrl);
    const textMessage = await fobAsText(fob);
    // const fob2 = await textToBlob(textMessage);
    // const cid2 = await ipfsCid(fob2);
    debugger;
    const remoteCid = await pinFile(fob);
    // This should never fail, but just in case
    if (cid !== remoteCid) {
      debugger;
      throw new Error("Uploaded file CID doesn't match the expected CID.");
    }

    debugger;

    try {
      debugger;
      const res = await axios.get(cidToUrl(cid));
      debugger;
      setState("VERIFYING");
      if (res.data !== textMessage) {
        throw new Error("Couldn't fetch uploaded file.");
      }
    } catch (err) {
      debugger;
      setState("ERROR");
      return;
    }

    debugger;

    setState("PUBLISHED");
  }

  return { state, decrypt, publish, dataUrl };
}
