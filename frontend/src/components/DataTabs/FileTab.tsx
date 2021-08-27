import { useCallback, useEffect, useRef, useState } from "react";
import { resetFileInput } from "../../util/resetFileInput";
import { FilePreviewWithInfo } from "./FilePreviewWithInfo";

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
