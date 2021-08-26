import { ReactNode, useState } from "react";
import { Loader } from "../generic/Loader";
import { pinFile } from "../util/pinata";

export function UploadToIpfsButton({
  fileOrBlob,
  onUpload,
  children,
}: {
  fileOrBlob: File | Blob | null;
  onUpload?: (cid: string) => void;
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function submitPinataUpload() {
    if (!fileOrBlob) {
      alert("Please add a file or some text to submit.");
      return;
    }
    setIsLoading(true);
    // const file = new Blob([str], { type: "plain" });
    // const remoteHash = await pinFile(apiKey, apiSecret, fileOrBlob);
    try {
      const cid = await pinFile(fileOrBlob);
      onUpload && onUpload(cid);
    } catch (err) {
      alert("Error uploading file");
    }
    setIsLoading(false);
  }

  return (
    <button onClick={submitPinataUpload} disabled={isLoading}>
      {isLoading ? <Loader /> : children}
      <div className="pt1" />
      <div className="f6 gray">(from above section)</div>
    </button>
  );
}
