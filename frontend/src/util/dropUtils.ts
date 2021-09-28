import utf8Enc from "crypto-js/enc-utf8";
import aes from "crypto-js/aes";
import { base64ToBlob } from "base64-blob";

export function blobAsDataUrl(blob: Blob) {
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

export const cidToUrl = (cid: string) => {
  return `https://hashdrop.mypinata.cloud/ipfs/${cid}`;
};

const PASSWORD = "whatever";

export function encrypt(dataUrl: string) {
  const encrypted = aes.encrypt(dataUrl, PASSWORD).toString();
  return encrypted;
}

export function decrypt(data: string) {
  const decrypted = aes.decrypt(data, PASSWORD).toString(utf8Enc);
  return decrypted;
}
