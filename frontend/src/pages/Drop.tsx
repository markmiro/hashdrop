import aes from "crypto-js/aes";
import delay from "delay";
import queryString from "query-string";
import { FC, useCallback, useState } from "react";
import { DataTabs } from "../components/DataTabs/DataTabs";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { Cid } from "../generic/Cid";
import { CopyButton } from "../generic/CopyButton";
import { Cover } from "../generic/Cover";
import { Loader } from "../generic/Loader";
import { HashDrop as T } from "../typechain";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile } from "../util/pinata";
import { textToBlob } from "../util/textToBlob";

// const DROP_ORIGIN = `https://ipfs.io/ipfs/${HASHDROP_DEPLOY_CID}`;
const DROP_ORIGIN = window.location.origin;
// const DROP_ORIGIN = "https://www.hashdrop.me";

const dropUrl = (dropId: string) => `${DROP_ORIGIN}/#/drop/${dropId}`;

const tweetUrl = (dropId: string) =>
  `https://twitter.com/intent/tweet?${queryString.stringify({
    text: "I made a prediction",
    url: dropUrl(dropId),
  })}`;

function useAdd() {
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const add = useCallback(
    async (cid: string) => {
      setSuccess(false);
      setLoading(true);
      if (!hashdrop.contract) throw new Error("Contract isn't set yet");

      const signer = provider.getSigner();
      const tx = await hashdrop.contract.connect(signer).add(cid);
      await tx.wait();
      setSuccess(true);

      setLoading(false);
    },
    [provider, hashdrop]
  );

  const addPrivate = useCallback(
    async (cid: string, privateCid: string) => {
      setSuccess(false);
      setLoading(true);
      if (!hashdrop.contract) throw new Error("Contract isn't set yet");

      const signer = provider.getSigner();
      const tx = await hashdrop.contract
        .connect(signer)
        .addPrivate(cid, privateCid);
      await tx.wait();
      setSuccess(true);

      setLoading(false);
    },
    [provider, hashdrop]
  );

  return { add, addPrivate, loading, success };
}

async function encryptFileOrBlob(fileOrBlob: File | Blob, password: string) {
  const dataUrl = await fileOrBlobAsDataUrl(fileOrBlob);
  const encrypted = aes.encrypt(dataUrl, password).toString();
  const pFileOrBlob = textToBlob(encrypted);
  return pFileOrBlob;
}

type DropStatus =
  | "INITIAL"
  | "PROCESSING"
  | "ENCRYPTING"
  | "SENDING_IPFS"
  | "SENDING_ETH"
  | "SUCCESS"
  | "ERROR";

const StatusText: FC<{
  status: DropStatus;
  error: string;
  onReset: () => void;
}> = ({ status, error, onReset, children }) => {
  switch (status) {
    case "INITIAL":
      return <>{children}</>;
    case "PROCESSING":
      return <Loader>Processing</Loader>;
    case "ENCRYPTING":
      return <Loader>Encrypting</Loader>;
    case "SENDING_IPFS":
      return <Loader>Sending to IPFS</Loader>;
    case "SENDING_ETH":
      return <Loader>Saving to Ethereum blockchain</Loader>;
    case "SUCCESS":
      return (
        <div className="pa4 tc bg-light-green">
          <div>😎</div>
          Success
          <button className="w-100 mt2 pa2" onClick={onReset}>
            OK
          </button>
        </div>
      );
    case "ERROR":
      return (
        <div className="pa4 tc bg-washed-red red">
          <div>😵</div>
          Error
          {error && <div className="f6">{error}</div>}
          <button className="w-100 mt2 pa2" onClick={onReset}>
            OK
          </button>
        </div>
      );
    default:
      return <>{children}</>;
  }
};

function useHashDrop() {
  const provider = useEthersProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cid, setCid] = useState("");
  const [privateCid, setPrivateCid] = useState("");
  const [status, setStatus] = useState<DropStatus>("INITIAL");
  const [error, setError] = useState("");
  const ethAdd = useAdd();

  const updateStatus = async (status: DropStatus) => {
    setStatus(status);
    await delay(1000);
  };

  const resetStatus = () => setStatus("INITIAL");

  const add = useCallback(
    async (fileOrBlob: File | Blob | null) => {
      try {
        setIsProcessing(true);
        await updateStatus("PROCESSING");

        if (!fileOrBlob) throw new Error("Please pick a file.");
        const cid = await ipfsCid(fileOrBlob);
        setCid(cid);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.add(cid);
        await updateStatus("SENDING_IPFS");
        const remoteCid = await pinFile(fileOrBlob);
        if (cid !== remoteCid) throw new Error("Internal error.");
        await updateStatus("SUCCESS");
        setIsProcessing(false);
      } catch (err) {
        setStatus("ERROR");
        setError(err.message);
        setIsProcessing(false);
        // throw new Error(err);
      }
    },
    [ethAdd]
  );

  const addPrivate = useCallback(
    async (fileOrBlob: File | Blob | null) => {
      try {
        setStatus("PROCESSING");
        setIsProcessing(true);
        if (!fileOrBlob) throw new Error("Please pick a file.");

        // Create password
        await updateStatus("ENCRYPTING");
        const cid = await ipfsCid(fileOrBlob);
        setCid(cid);
        const ps = await provider.getSigner().signMessage(cid);

        // Encrypt
        const privateFileOrBlob = await encryptFileOrBlob(fileOrBlob, ps);
        const privateCid = await ipfsCid(privateFileOrBlob);
        setPrivateCid(privateCid);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.addPrivate(cid, privateCid);
        await updateStatus("SENDING_IPFS");
        const remotePrivateCid = await pinFile(privateFileOrBlob);
        if (privateCid !== remotePrivateCid) throw new Error("Internal error.");
        setStatus("SUCCESS");
        setIsProcessing(false);
      } catch (err) {
        setStatus("ERROR");
        setError(err.message);
        setIsProcessing(false);
        // throw new Error(err);
      }
    },
    [provider, ethAdd]
  );

  const verify = useCallback(async (fileOrBlob: File | Blob | null, cid) => {
    throw new Error("TODO: implement");
  }, []);

  return {
    add,
    cid,
    privateCid,
    addPrivate,
    verify,
    status,
    isProcessing,
    error,
    resetStatus,
  };
}

export function Drop() {
  const [fileOrBlob, setFileOrBlob] = useState<File | Blob | null>(null);
  const hashdrop = useHashDrop();

  return (
    <div>
      <div className="pt4" />
      <h1 className="mv0">Drop</h1>
      <div className="pt4" />
      <DataTabs onFileOrBlobChange={setFileOrBlob} />
      <div className="pt4" />
      {/* <button
        className="pa2 w-100"
        disabled={!fileOrBlob}
        onClick={() => hashdrop.add(fileOrBlob)}
      >
        Add
      </button> */}
      {/* <div className="pt2" /> */}
      <button
        className="pa2 w-100"
        disabled={!fileOrBlob}
        onClick={() => hashdrop.addPrivate(fileOrBlob)}
      >
        Add Private
      </button>
      {hashdrop.status !== "INITIAL" && (
        <Cover>
          <div className="shadow-4 ba measure w-100 tc bg-white pa2">
            <StatusText
              status={hashdrop.status}
              error={hashdrop.error}
              onReset={hashdrop.resetStatus}
            />
          </div>
        </Cover>
      )}
      {!hashdrop.isProcessing && hashdrop.cid && (
        <>
          <div className="flex" style={{ gap: ".5em" }}>
            <CopyButton toCopy={dropUrl(hashdrop.cid)} />
            {/* https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent */}
            <a href={tweetUrl(hashdrop.cid)}>Tweet</a>
            <a href={dropUrl(hashdrop.cid)} target="_blank" rel="noreferrer">
              See Drop
            </a>
          </div>
          <Cid cid={hashdrop.cid} />
        </>
      )}
      <p>
        <a href="https://www.kalzumeus.com/essays/dropping-hashes">
          Dropping hashes: an idiom used to demonstrate provenance of documents
        </a>
      </p>
    </div>
  );
}
