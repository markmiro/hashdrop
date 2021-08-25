import { ReactNode, useState } from "react";
import { Loader } from "../generic/Loader";
import { pinFile, unpin } from "../util/pinata";

export function UploadToIpfsButton({
  fileOrBlob,
  children,
}: {
  fileOrBlob: File | Blob | null;
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [expectedHash, setExpectedHash] = useState("");

  async function submitPinataUpload() {
    if (!fileOrBlob) {
      alert("Please add a file or some text to submit.");
      return;
    }
    setIsLoading(true);
    // const file = new Blob([str], { type: "plain" });
    // const remoteHash = await pinFile(apiKey, apiSecret, fileOrBlob);
    try {
      const remoteHash = await pinFile(fileOrBlob);
      setExpectedHash(remoteHash);
      alert("Upload worked!");
    } catch (err) {
      debugger;
      setExpectedHash("");
      alert("Error uploading file");
    }
    setIsLoading(false);
  }

  return (
    <button
      onClick={submitPinataUpload}
      className="ba br2 b--black bg-washed-yellow ph2 pv1"
      disabled={isLoading}
    >
      {isLoading ? <Loader /> : children}
      <div className="pt1" />
      <div className="f6 gray">(from above section)</div>
    </button>
  );
}
