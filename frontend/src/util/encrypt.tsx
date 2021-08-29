import aes from "crypto-js/aes";
import { fileOrBlobAsDataUrl } from "./fileOrBlobAsDataUrl";
import { textToBlob } from "./textToBlob";
import utf8Enc from "crypto-js/enc-utf8";

export async function encryptFileOrBlob(
  fileOrBlob: File | Blob,
  password: string
) {
  const dataUrl = await fileOrBlobAsDataUrl(fileOrBlob);
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
