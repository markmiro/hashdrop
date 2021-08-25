import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Cid } from "../generic/Cid";
import { ipfsCid } from "../util/ipfsCid";
import { DataTabs } from "../components/DataTabs";

export function Drop() {
  const [fileOrBlob, setFileOrBlob] = useState<File | Blob | null>(null);
  const [dropId, setDropId] = useState("");
  const [localCid, setLocalCid] = useState("");

  useEffect(() => {
    setDropId(uuid());
  }, []);

  async function updateLocalCid(fileOrBlob: File | Blob | null) {
    setFileOrBlob(fileOrBlob);
    if (!fileOrBlob) {
      setLocalCid("");
      return;
    }
    try {
      const cid = await ipfsCid(fileOrBlob);
      setLocalCid(cid);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="pt4" />
      <h1 className="mv0">Drop</h1>
      <div className="pt4" />
      <DataTabs onFileOrBlobChange={updateLocalCid} />
      <div className="db pa2 bg-black-05">
        Local CID:
        <Cid cid={localCid} />
        Drop ID:
        <div>{dropId}</div>
      </div>
    </div>
  );
}
