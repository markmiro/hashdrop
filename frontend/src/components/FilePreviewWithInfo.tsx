import { FC } from "react";
import { FilePreview } from "./FilePreview";

export const FilePreviewWithInfo: FC<{
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
