import { useCallback, useEffect, useRef, useState } from "react";
import { fileAsText } from "../util/fileAsText";
import { resetFileInput } from "../util/resetFileInput";
import { textTypes } from "../util/textTypes";

export function TextTab({
  onBlobChange,
  localHash,
}: {
  localHash: string;
  onBlobChange: (blob: Blob | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [textBlob, setTextBlob] = useState<Blob | null>(null);

  const updateText = useCallback(async (text) => {
    setText(text);
    const blob = new Blob([text], { type: "text/plain" });
    setTextBlob(blob);
  }, []);

  const resetText = () => {
    setText("");
    setTextBlob(null);
    if (fileRef?.current) resetFileInput(fileRef.current);
  };

  const updateTextFile = useCallback(async (file: null | File | Blob) => {
    if (!file) return;
    if (textTypes.includes(file.type)) {
      const text = await fileAsText(file);
      setText(text);
    } else {
      setText("");
    }
    setTextBlob(file);
  }, []);

  useEffect(() => {
    onBlobChange(textBlob);
  }, [textBlob]);

  return (
    <>
      <textarea
        autoFocus
        placeholder="Type here..."
        className="ba br2 b--black bg-washed-yellow pa2 db w-100 h4"
        value={text}
        onChange={(e) => updateText(e.target.value)}
      />
      <div className="pt2" />
      <div className="flex">
        <input
          ref={fileRef}
          type="file"
          className="db w-100"
          accept={textTypes.join(",")}
          onChange={(e) => updateTextFile(e.target?.files?.[0] ?? null)}
        />
        <div className="pl2" />
        <a
          className={`dib ba br2 ph2 no-underline bg-washed-yellow black flex-shrink-0 ${
            !text && "o-40"
          }`}
          style={{ pointerEvents: text ? "all" : "none" }}
          download={`${localHash}.txt`}
          href={"data:text/plain," + encodeURIComponent(text)}
        >
          ⇣ Download
        </a>
        <div className="pl2" />
        <button onClick={resetText} disabled={!text}>
          Clear
        </button>
      </div>
    </>
  );
}
