import { useState } from "react";
import { Cid } from "../generic/Cid";
import { Tab, Tabs } from "../generic/Tabs";
import { ipfsCid } from "../util/ipfsCid";
import { TextTab } from "../components/TextTab";
import { FileTab } from "../components/FileTab";

type ContentTab = "TEXT" | "FILE";

export function Drop() {
  const [contentTab, setContentTab] = useState<ContentTab>("TEXT");
  const [localCid, setLocalCid] = useState("");

  async function updateLocalCid(fileOrBlob: File | Blob | null) {
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
      <Tabs<ContentTab> value={contentTab} onChange={setContentTab}>
        <Tab label="Text" value="TEXT">
          <TextTab onBlobChange={updateLocalCid} localHash={localCid} />
        </Tab>
        <Tab label="File" value="FILE">
          <FileTab onFileChange={updateLocalCid} />
        </Tab>
      </Tabs>
      <div className="db pa2 bg-black-05">
        Local CID:
        <Cid cid={localCid} />
      </div>
    </div>
  );
}
