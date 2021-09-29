import utf8Enc from "crypto-js/enc-utf8";
import aes from "crypto-js/aes";
import { base64ToBlob } from "base64-blob";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { ipfsCid } from "./ipfsCid";
import { pinFile } from "./pinata";

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl: string) {
  return base64ToBlob(dataUrl);
}

export function textToBlob(text: string) {
  return new Blob([text], { type: "text/plain" });
}

export async function blobToCid(blob: Blob) {
  return ipfsCid(blob);
}

export const cidToUrl = (cid: string) => {
  return `https://hashdrop.mypinata.cloud/ipfs/${cid}`;
};

export function pinBlob(blob: Blob) {
  return pinFile(blob);
}

function encrypt(dataUrl: string, password: string) {
  const encrypted = aes.encrypt(dataUrl, password).toString();
  return encrypted;
}

function decrypt(data: string, password: string) {
  const decrypted = aes.decrypt(data, password).toString(utf8Enc);
  return decrypted;
}

export function useEncrypter() {
  const provider = useEthersProvider();

  return {
    encrypt: async (blob: Blob) => {
      const cid = await blobToCid(blob);
      const signer = provider.getSigner();
      const password = await signer.signMessage(cid);
      const dataUrl = await blobToDataUrl(blob);
      return encrypt(dataUrl, password);
    },
    decrypt: async (data: string, cid: string) => {
      const signer = provider.getSigner();
      const password = await signer.signMessage(cid);
      return decrypt(data, password);
    },
  };
}
