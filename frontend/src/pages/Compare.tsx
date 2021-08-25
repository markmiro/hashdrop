import React, { useCallback, useEffect, useRef, useState } from "react";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile, unpin } from "../util/pinata";
import { Tab, Tabs } from "../generic/Tabs";
import { VStack } from "../generic/VStack";
import { fileOrBlobAsText } from "../util/fileOrBlobAsText";
import { textTypes } from "../util/textTypes";
import { Cid } from "../generic/Cid";
import { resetFileInput } from "../util/resetFileInput";

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
      const text = await fileOrBlobAsText(file);
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
      debugger;
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
    <div>
      <div className="pt4" />
      <h1 className="ma0">Compare CIDs</h1>
      <p className="mv0 f6 black-60">
        Compare locally calculated CID against an expected CID.{" "}
        <a
          href="https://docs.ipfs.io/concepts/content-addressing/"
          className="link underline black"
        >
          Learn more →
        </a>
      </p>
      <div className="pt4" />
      <Tabs<ContentTab> value={contentTab} onChange={setContentTab}>
        <Tab label="Text" value="TEXT">
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
        </Tab>
        <Tab label="File" value="FILE">
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
        </Tab>
      </Tabs>
      <div className="db pa2 bg-black-05">
        Local CID:
        <Cid cid={localHash} />
      </div>

      <div className="tc f5 pv2">
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
                className="ba br2 b--black bg-washed-yellow pa1 db w-100"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
              />
              <div className="pl2" />
              <button onClick={() => setExpectedHash("")}>Clear</button>
            </div>
          </label>
          <div className="pt2" />
          <div className="gray tc f7">
            See{" "}
            <a
              href="https://docs.ipfs.io/concepts/content-addressing"
              className="link black underline pointer"
              rel="noreferrer"
              target="_blank"
            >
              IPFS Docs: Content addressing and CIDs
            </a>
            .
          </div>
        </Tab>
        <Tab<ExpectedTab> label="Pinata Upload" value="PINATA">
          <div className="tc">
            <button
              onClick={submitPinataUpload}
              className="ba br2 b--black bg-washed-yellow ph2 pv1"
              disabled={!localHash || isLoading}
            >
              {isLoading ? "Loading..." : "Upload " + contentTab}
              <div className="pt1" />
              <div className="f6 gray">(from above section)</div>
            </button>

            <div className="pt2" />
            <div className="gray f7">
              Learn more about{" "}
              <a
                href="https://pinata.cloud"
                className="link black underline pointer"
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
      <div className="db pa2 bg-black-05">
        Expected CID:
        <Cid cid={expectedHash} />
        <div className="pt2" />
        <div className="tr">
          <button
            onClick={() => setExpectedHash("")}
            disabled={!expectedHash || isLoading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="tc f5 pv2">
        <div>|</div>
        RESULTS:
        <div>↓</div>
      </div>

      <div className="ba pa2">
        <VStack space={2}>
          {isLoading ? (
            <div className="pa4 tc bg-black-05">Loading...</div>
          ) : localHash && expectedHash ? (
            localHash === expectedHash ? (
              <div className="pa4 tc bg-light-green">
                <div>😎</div>
                CIDs match
              </div>
            ) : (
              <div className="pa4 tc bg-washed-red red">
                <div>😵</div>
                CIDs don't match
              </div>
            )
          ) : (
            <div className="pa4 tc bg-light-blue">
              <div className="bb mb2">NOTE:</div>
              Please upload a file or type some text
              <div className="tc">
                <span className="br4 bg-black-20 ph2">AND</span>
              </div>
              enter an expected CID or upload your file to Pinata.
            </div>
          )}
        </VStack>
      </div>

      <hr className="w-100 mv4 bt b--black-20" style={{ borderBottom: 0 }} />

      <div className="tc">
        <button onClick={reset}>↺ Reset</button>
      </div>
    </div>
  );
}
