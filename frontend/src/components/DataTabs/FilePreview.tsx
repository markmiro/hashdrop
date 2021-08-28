import { useEffect, useRef } from "react";

// RESOURCES
// ---
// MIME Types:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// Data URIs:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs

export function FilePreview({
  file,
  dataUrl,
}: {
  file: File | Blob | null;
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
