import { useCallback, useEffect, useRef, useState } from "react";
import { resetFileInput } from "../util/resetFileInput";

export function FileTab({
  onFileChange,
}: {
  onFileChange: (blob: Blob | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const updateFile = useCallback(async (file: null | File) => {
    if (!file) return;
    setFile(file);
  }, []);

  const resetFile = () => {
    setFile(null);
    if (fileRef?.current) resetFileInput(fileRef.current);
    if (previewRef && previewRef.current) {
      previewRef.current.src = "";
    }
  };

  useEffect(() => {
    onFileChange(file);
  }, [onFileChange, file]);

  return (
    <>
      <div className="relative br2 ba b--dashed bg-washed-yellow pa4 tc">
        <input
          ref={fileRef}
          type="file"
          className="absolute top-0 left-0 w-100 h-100 o-0"
          onChange={(e) => updateFile(e.target?.files?.[0] ?? null)}
        />
        <div className="">🖼 Choose a file</div>
      </div>
      {file && (
        <>
          <div className="pv1" />
          <div>
            {"File: " + ("name" in file ? file.name : file)}
            {", "}
            {"MIME Type: " + file.type}
          </div>
          <div className="pv1" />
          <iframe
            ref={previewRef}
            width="100%"
            title="ipfs preview"
            className="db ba"
            style={{ height: "20vh" }}
            src={window.URL.createObjectURL(file)}
          />
          <div className="pt2" />
          <div className="tr">
            <button onClick={resetFile} disabled={!file}>
              Clear
            </button>
          </div>
        </>
      )}
    </>
  );
}
