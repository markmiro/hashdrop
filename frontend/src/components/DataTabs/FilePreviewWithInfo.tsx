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
        <div className="border flex flex-col">
          <FilePreview file={file} dataUrl={dataUrl} />
        </div>
        <div className="bg-black bg-opacity-5 p-2 text-sm flex">
          <div className="overflow-hidden">
            <div className="font-semibold truncate">{fileName}</div>
            {file?.type && <div className="opacity-50">{file.type}</div>}
          </div>
          <div className="flex-auto" />
          <div className="flex-shrink-0">{children}</div>
        </div>
      </div>
    </div>
  );
};
