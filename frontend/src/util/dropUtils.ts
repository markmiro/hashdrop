import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { base64ToBlob } from "base64-blob";
import aes from "crypto-js/aes";
import utf8Enc from "crypto-js/enc-utf8";
import delay from "delay";
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

/**
 * Need to retrieve from another place because of a bug with Pinata that I contacted them about.
 * The problem is that if you fetch a drop before it's published, then the 404 is cached until you retrieve
 * it from another client.
 */
export async function retrieveCidFromOtherServer(cid: string) {
  await axios.get(`https://get-drop-api-workaround.vercel.app/api/get/${cid}`);

  await delay(1000);

  const client = axios.create();
  axiosRetry(client, {
    retries: 20,
    retryDelay: (retryCount) => {
      console.log(`retry attempt: ${retryCount}`);
      return retryCount * 2000; // time interval between retries
    },
    // Default retry conditions don't work with 404 errors
    retryCondition: (error) => {
      return error.response?.status === 404;
    },
  });
  return client.get(cidToUrl(cid));
}

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
