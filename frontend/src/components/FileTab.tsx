import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Pulse } from "../generic/Pulse";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";
import { resetFileInput } from "../util/resetFileInput";

function FilePreview({
  file,
  dataUrl,
}: {
  file: File | null;
  dataUrl: string;
}) {
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Clear preview when file changes
  useEffect(() => {
    if (file === null && previewRef && previewRef.current) {
      previewRef.current.src = "";
    }
  }, [file, previewRef]);

  if (!file) return null;

  if (!file.type || !dataUrl) {
    return <div className="pa2 tc b bg-black-05 w-100 f1">📄</div>;
  }

  const isFileImage = file.type.includes("image");
  if (isFileImage) {
    return (
      <img className="db h5 mr-auto ml-auto" src={dataUrl} alt="uploaded" />
    );
  }

  return (
    <iframe
      ref={previewRef}
      width="100%"
      title="ipfs preview"
      className="db b--none"
      style={{ height: "20vh" }}
      src={dataUrl}
    />
  );
}

const FilePreviewWithInfo: FC<{
  file: File | null;
  dataUrl: string;
}> = ({ file, dataUrl, children }) => {
  if (!file) return null;
  const fileName = file?.name || "";

  return (
    <div>
      <div>
        <div className="ba b--black-10 bw2 bg-white flex flex-column justify-center">
          <FilePreview file={file} dataUrl={dataUrl} />
        </div>
        <div className="bg-black-10 pa2 f7 flex">
          <div>
            <div className="truncate b">{fileName}</div>
            {file?.type && <div className="o-50">{file.type}</div>}
          </div>
          <div className="flex-auto" />
          {children}
        </div>
      </div>
    </div>
  );
};

export function FileTab({
  onFileChange,
}: {
  onFileChange: (blob: Blob | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileDataUrl, setFileDataUrl] = useState("");

  const updateFile = useCallback(async (file: null | File) => {
    if (!file) return;
    setFile(file);
  }, []);

  const resetFile = () => {
    setFile(null);
    if (fileRef?.current) resetFileInput(fileRef.current);
  };

  useEffect(() => {
    onFileChange(file);
    if (file) {
      const dataUrl = window.URL.createObjectURL(file);
      setFileDataUrl(dataUrl);
    }
  }, [onFileChange, file]);

  if (file) {
    return (
      <FilePreviewWithInfo file={file} dataUrl={fileDataUrl}>
        <button onClick={resetFile} disabled={!file}>
          ✖️ Remove
        </button>
      </FilePreviewWithInfo>
    );
  }

  return (
    <>
      <div className="relative br2 ba b--dashed bg-black-05 pa4 tc">
        <input
          ref={fileRef}
          type="file"
          className="absolute top-0 left-0 w-100 h-100 o-0"
          onChange={(e) => updateFile(e.target?.files?.[0] ?? null)}
        />
        <div className="">📄 Choose a file</div>
      </div>
      {file && (
        <>
          <div className="pt2" />
        </>
      )}
    </>
  );
}
