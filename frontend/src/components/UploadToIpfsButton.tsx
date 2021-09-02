import { ReactNode, useState } from "react";
import { Cid } from "../eth-react/Cid";
import { Loader } from "../generic/Loader";
import { pinFile } from "../util/pinata";

export function UploadToIpfsButton({
  fob,
  onUpload,
  children,
}: {
  fob: File | Blob | null;
  onUpload?: (cid: string) => void;
  children: ReactNode;
}) {
  const [remoteCid, setRemoteCid] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitPinataUpload() {
    if (!fob) {
      alert("Please add a file or some text to submit.");
      return;
    }
    setIsLoading(true);
    // const file = new Blob([str], { type: "plain" });
    // const remoteHash = await pinFile(apiKey, apiSecret, fob);
    try {
      const cid = await pinFile(fob, { name: "test-upload" });
      setRemoteCid(cid);
      onUpload && onUpload(cid);
    } catch (err) {
      alert("Error uploading file");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col">
      <button
        className="btn-blue p-2"
        onClick={submitPinataUpload}
        disabled={isLoading}
      >
        {isLoading ? <Loader /> : children}
        <div className="text-xs font-normal text-white text-opacity-60">
          (from above section)
        </div>
      </button>
      <label>
        Remote CID: <Cid cid={remoteCid} />
      </label>
    </div>
  );
}
