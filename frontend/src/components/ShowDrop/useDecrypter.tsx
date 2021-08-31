import { useState } from "react";
import { cidToUrl, pinFile } from "../../util/pinata";
import { decryptFileString } from "../../util/encrypt";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";
import { base64ToBlob } from "base64-blob";

export type DecrypterState =
  | "INITIAL"
  | "LOADING"
  | "DECRYPTING"
  | "DECRYPTED"
  | "PUBLISHING"
  | "PUBLISHED";

export function useDecrypter() {
  const provider = useEthersProvider();
  const [cid, setCid] = useState("");
  const [state, setState] = useState<DecrypterState>("INITIAL");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  async function decrypt(cid: string, privateCid: string) {
    setState("LOADING");
    const res = await fetch(cidToUrl(privateCid));
    if (res.status === 404) {
      throw new Error("Not found");
    }
    const encrypted = await res.text();
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
    const remoteCid = await pinFile(fob, { name: "decrypted" });
    // This should never fail, but just inn case
    if (cid !== remoteCid) {
      throw new Error("Uploaded file CID doesn't match the expected CID.");
    }
    setState("PUBLISHED");
  }

  return { state, decrypt, publish, dataUrl };
}
