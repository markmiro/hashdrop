import { useCallback, useEffect, useRef, useState } from "react";
import { fobAsText } from "../../util/fobAsText";
import { resetFileInput } from "../../util/resetFileInput";
import { textTypes } from "../../util/textTypes";
import { textToBlob } from "../../util/textToBlob";
import { DownloadButton } from "./../DownloadButton";

export function TextTab({
  onBlobChange,
  cid,
}: {
  cid?: string;
  onBlobChange: (blob: Blob | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [textBlob, setTextBlob] = useState<Blob | null>(null);

  const updateText = useCallback(async (text) => {
    setText(text);
    const blob = textToBlob(text);
    setTextBlob(blob);
  }, []);

  const resetText = () => {
    setText("");
    if (fileRef?.current) resetFileInput(fileRef.current);
  };

  const updateTextFile = useCallback(async (file: null | File | Blob) => {
    if (!file) return;
    if (textTypes.includes(file.type)) {
      const text = await fobAsText(file);
      setText(text);
    } else {
      setText("");
    }
    setTextBlob(file);
  }, []);

  useEffect(() => {
    if (!text) setTextBlob(null);
  }, [text]);

  useEffect(() => {
    onBlobChange(textBlob);
  }, [onBlobChange, textBlob]);

  return (
    <>
      <textarea
        autoFocus
        placeholder="Type here..."
        className="w-full"
        style={{ height: "20vh" }}
        value={text}
        onChange={(e) => updateText(e.target.value)}
      />
      <div className="pt-1" />
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          className="block w-full"
          accept={textTypes.join(",")}
          onChange={(e) => updateTextFile(e.target?.files?.[0] ?? null)}
        />
        <DownloadButton cid={cid} text={text} />
        <button className="btn-light" onClick={resetText} disabled={!text}>
          Clear
        </button>
      </div>
    </>
  );
}
