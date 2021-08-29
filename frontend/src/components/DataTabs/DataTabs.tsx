import { useState } from "react";
import { Tab, Tabs } from "../../generic/Tabs";
import { TextTab } from "./TextTab";
import { FileTab } from "./FileTab";

type ContentTab = "TEXT" | "FILE";

// TODO: Make this a controlled component by adding `fileOrBlob` prop so it's possible for parent component to reset it.
export function DataTabs({
  onFileOrBlobChange,
  cid,
}: {
  onFileOrBlobChange: (fob: File | Blob | null) => void;
  cid?: string;
}) {
  const [contentTab, setContentTab] = useState<ContentTab>("TEXT");

  return (
    <Tabs<ContentTab> value={contentTab} onChange={setContentTab}>
      <Tab label="Text" value="TEXT">
        <TextTab onBlobChange={onFileOrBlobChange} cid={cid} />
      </Tab>
      <Tab label="File" value="FILE">
        <FileTab onFileChange={onFileOrBlobChange} />
      </Tab>
    </Tabs>
  );
}
