import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fileOrBlobAsText } from "../util/fileOrBlobAsText";
import { resetFileInput } from "../util/resetFileInput";
import { textTypes } from "../util/textTypes";
import { textToBlob } from "../util/textToBlob";

function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd-HH_mm_ss");
}

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
      const text = await fileOrBlobAsText(file);
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
          download={`${cid ?? "hashdrop-" + formatDate(new Date())}.txt`}
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
