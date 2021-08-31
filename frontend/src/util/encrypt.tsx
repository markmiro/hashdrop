import aes from "crypto-js/aes";
import { fobAsDataUrl } from "./fobAsDataUrl";
import { textToBlob } from "./textToBlob";
import utf8Enc from "crypto-js/enc-utf8";

export async function encryptFob(fob: File | Blob, password: string) {
  const dataUrl = await fobAsDataUrl(fob);
  const encrypted = aes.encrypt(dataUrl, password).toString();
  const blob = textToBlob(encrypted);
  return blob;
}

export async function decryptFileString(data: string, password: string) {
  const decryptedDataUrl = aes.decrypt(data, password).toString(utf8Enc);
  return decryptedDataUrl;
  // const blob = textToBlob(decrypted);
  // return blob;
}
