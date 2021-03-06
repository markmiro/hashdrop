import axios from "axios";
import FormData from "form-data";
import { PinMetadata } from "../types";

/**
 * @param cid
 * @returns Pinata Gateway IPFS url CID
 */
export const cidToUrl = (cid: string) =>
  `https://${process.env.REACT_APP_IPFS_GATEWAY}/ipfs/${cid}`;

// Returns IPFS hash (CID)
export async function pinFile(file: File | Blob, pinataMetadata?: PinMetadata) {
  const url = `/api/upload`;

  // We gather a local file for this example, but any valid readStream source will work here.
  let data = new FormData();
  data.append("file", file);

  if (pinataMetadata) {
    data.append("pinataMetadata", JSON.stringify(pinataMetadata));
  }

  const response = await axios.post(url, data, {
    maxBodyLength: Infinity, // this is needed to prevent axios from erroring out with large files
    headers: {
      "Content-Type": `multipart/form-data`,
    },
  });

  return response.data.cid;
}

export async function unpin(cid: string) {
  const url = `/api/remove/${cid}`;
  return axios.delete(url);
}
