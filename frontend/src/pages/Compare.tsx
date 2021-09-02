import React, { useCallback, useEffect, useRef, useState } from "react";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile, unpin } from "../util/pinata";
import { Tab, Tabs } from "../generic/Tabs";
import { fobAsText } from "../util/fobAsText";
import { textTypes } from "../util/textTypes";
import { Cid } from "../eth-react/Cid";
import { resetFileInput } from "../util/resetFileInput";
import { Loader } from "../generic/Loader";
import styles from "../generic/styles.module.css";

type ContentTab = "TEXT" | "FILE";
type ExpectedTab = "STRING" | "PINATA";

export function Compare() {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [contentTab, setContentTab] = useState<ContentTab>("TEXT");
  const [expectedTab, setExpectedTab] = useState<ExpectedTab>("STRING");
  const [text, setText] = useState("");
  const [textFile, setTextFile] = useState<Blob | null>(null);
  const [file, setFile] = useState<File | Blob | null>(null);
  const [localHash, setLocalHash] = useState("");
  const [expectedHash, setExpectedHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateFile = useCallback(async (file: null | File | Blob) => {
    if (!file) return;
    setFile(file);
  }, []);

  const updateTextFile = useCallback(async (file: null | File | Blob) => {
    if (!file) return;
    if (textTypes.includes(file.type)) {
      const text = await fobAsText(file);
      setText(text);
    } else {
      setText("");
    }
    setTextFile(file);
  }, []);

  const updateText = useCallback(async (text) => {
    setText(text);
    const blob = new Blob([text], { type: "text/plain" });
    setTextFile(blob);
  }, []);

  const resetText = () => {
    setText("");
    setLocalHash("");
    setTextFile(null);
    if (fileRef?.current) resetFileInput(fileRef.current);
  };

  const resetFile = () => {
    setFile(null);
    setLocalHash("");
    if (fileRef?.current) resetFileInput(fileRef.current);
    if (previewRef && previewRef.current) {
      previewRef.current.src = "";
    }
  };

  const reset = () => {
    setIsLoading(false);
    resetText();
    resetFile();
    setExpectedHash("");
  };

  async function submitPinataUpload() {
    let content = null;
    switch (contentTab) {
      case "TEXT":
        content = textFile;
        break;
      case "FILE":
        content = file;
        break;
    }

    if (!content) {
      alert("Please add a file or some text to submit.");
      return;
    }
    setIsLoading(true);
    // const file = new Blob([str], { type: "plain" });
    // const remoteHash = await pinFile(apiKey, apiSecret, content);
    try {
      const remoteHash = await pinFile(content);
      setExpectedHash(remoteHash);
      await unpin(remoteHash);
    } catch (err) {
      setExpectedHash("");
      alert("Error uploading file");
    }
    setIsLoading(false);
  }

  async function updateCid(file: File | Blob) {
    if (!file) setLocalHash("");
    try {
      const cid = await ipfsCid(file);
      setLocalHash(cid);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    switch (contentTab) {
      case "TEXT":
        if (!text) {
          setLocalHash("");
          return;
        }
        textFile && updateCid(textFile);
        break;
      case "FILE":
        if (!file) {
          setLocalHash("");
          return;
        }
        updateCid(file);
        break;
    }
  }, [contentTab, text, textFile, file]);

  return (
    <div className={`font-mono ${styles.body}`}>
      <div className="pt-4" />
      <h1 className="font-bold">Compare CIDs</h1>
      <p className="text-black text-opacity-60">
        Compare locally calculated CID against an expected CID.{" "}
        <a
          href="https://docs.ipfs.io/concepts/content-addressing/"
          className="link underline black"
        >
          Learn more →
        </a>
      </p>
      <div className="pt-4" />
      <Tabs<ContentTab> value={contentTab} onChange={setContentTab}>
        <Tab label="Text" value="TEXT">
          <textarea
            autoFocus
            placeholder="Type here..."
            className="border min-w-full h-24"
            value={text}
            onChange={(e) => updateText(e.target.value)}
          />
          <div className="pt-2" />
          <div className="flex gap-2 items-center">
            <input
              ref={fileRef}
              type="file"
              className="block flex-grow"
              accept={textTypes.join(",")}
              onChange={(e) => updateTextFile(e.target?.files?.[0] ?? null)}
            />
            <a
              className={`btn-light flex-shrink-0 no-underline ${
                !text && "opacity-40 pointer-events-none"
              }`}
              download={`${localHash}.txt`}
              href={"data:text/plain," + encodeURIComponent(text)}
            >
              <span className="text-black">⇣ Download</span>
            </a>
            <button className="btn-light" onClick={resetText} disabled={!text}>
              Clear
            </button>
          </div>
        </Tab>
        <Tab label="File" value="FILE">
          <div className="relative border border-dashed p-4 text-center hover:bg-black hover:bg-opacity-5">
            <input
              ref={fileRef}
              type="file"
              className="absolute top-0 left-0 min-w-full min-h-full opacity-0"
              onChange={(e) => updateFile(e.target?.files?.[0] ?? null)}
            />
            <div className="">🖼 Choose a file</div>
          </div>
          {file && (
            <>
              <div className="pt-1" />
              <div>
                {"File: " + ("name" in file ? file.name : file)}
                {", "}
                {"MIME Type: " + file.type}
              </div>
              <div className="pt-1" />
              <iframe
                ref={previewRef}
                width="100%"
                title="ipfs preview"
                className="db ba"
                style={{ height: "20vh" }}
                src={window.URL.createObjectURL(file)}
              />
              <div className="pt-2" />
              <div className="text-right">
                <button
                  className="btn-light"
                  onClick={resetFile}
                  disabled={!file}
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </Tab>
      </Tabs>
      <div className="block p-2 bg-black bg-opacity-5">
        Local CID:
        <Cid cid={localHash} />
      </div>

      <div className="text-center py-2">
        <div>|</div>
        COMPARE LOCAL CID TO:
        <div>↓</div>
      </div>

      <Tabs<ExpectedTab> value={expectedTab} onChange={setExpectedTab}>
        <Tab<ExpectedTab> label="Expected String" value="STRING">
          <label>
            Expected CID:
            <div className="flex">
              <input
                type="text"
                className="w-full"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
              />
              <div className="pl-2" />
              <button className="btn-light" onClick={() => setExpectedHash("")}>
                Clear
              </button>
            </div>
          </label>
          <div className="pt-2" />
          <div className="text-opacity-60 text-center text-sm">
            See{" "}
            <a
              href="https://docs.ipfs.io/concepts/content-addressing"
              className="text-black underline"
              rel="noreferrer"
              target="_blank"
            >
              IPFS Docs: Content addressing and CIDs
            </a>
            .
          </div>
        </Tab>
        <Tab<ExpectedTab> label="Pinata Upload" value="PINATA">
          <div className="text-center">
            <button
              onClick={submitPinataUpload}
              className="btn-light"
              disabled={!localHash || isLoading}
            >
              {isLoading ? "Loading..." : "Upload " + contentTab}
              <div className="text-sm opacity-60 font-normal">
                (from above section)
              </div>
            </button>

            <div className="pt-2" />
            <div className="text-opacity-60 text-sm">
              Learn more about{" "}
              <a
                href="https://pinata.cloud"
                className="text-black underline"
                rel="noreferrer"
                target="_blank"
              >
                Pinata
              </a>
              .
            </div>
          </div>
        </Tab>
      </Tabs>
      <div className="block p-2 bg-black bg-opacity-5">
        Expected CID:
        <Cid cid={expectedHash} />
        <div className="pt-2" />
        <div className="text-right">
          <button
            className="btn-light"
            onClick={() => setExpectedHash("")}
            disabled={!expectedHash || isLoading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="text-center py-2">
        <div>|</div>
        RESULTS:
        <div>↓</div>
      </div>

      <div className="border border-black p-2">
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <Loader>Loading</Loader>
          ) : localHash && expectedHash ? (
            localHash === expectedHash ? (
              <div className="p-4 text-center bg-green-200">
                <div>😎</div>
                CIDs match
              </div>
            ) : (
              <div className="p-4 text-center bg-red-100 text-red-500">
                <div>😵</div>
                CIDs don't match
              </div>
            )
          ) : (
            <div className="p-4 text-center bg-blue-200">
              <div className="border-b border-black mb-2">NOTE:</div>
              Please upload a file or type some text
              <div className="text-center">
                <span className="rounded-full bg-black bg-opacity-10 px-3">
                  AND
                </span>
              </div>
              enter an expected CID or upload your file to Pinata.
            </div>
          )}
        </div>
      </div>

      <hr className="w-full my-4 border-t border-black border-opacity-20" />

      <div className="text-center">
        <button className="btn-red" onClick={reset}>
          ↺ Reset
        </button>
      </div>

      <div className="pt-4" />
    </div>
  );
}
