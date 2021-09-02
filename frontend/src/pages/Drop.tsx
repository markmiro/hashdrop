import queryString from "query-string";
import { FC, useCallback, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { DataTabs } from "../components/DataTabs/DataTabs";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { Cid } from "../eth-react/Cid";
import { Cover } from "../generic/Cover";
import { Loader } from "../generic/Loader";
import { HashDrop as T } from "../typechain";
import { encryptFob } from "../util/encrypt";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile, unpin } from "../util/pinata";
import styles from "../generic/styles.module.css";

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
  const handleError = useErrorHandler();
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const add = useCallback(
    async (cid: string) => {
      try {
        setSuccess(false);
        setLoading(true);
        if (!hashdrop.contract) throw new Error("Contract isn't set yet");

        const signer = provider.getSigner();
        const tx = await hashdrop.contract.connect(signer).add(cid);
        await tx.wait();
        setSuccess(true);

        setLoading(false);
      } catch (err) {
        handleError(err);
      }
    },
    [provider, hashdrop, handleError]
  );

  const addPrivate = useCallback(
    async (cid: string, privateCid: string) => {
      try {
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
      } catch (err) {
        handleError(err);
      }
    },
    [provider, hashdrop, handleError]
  );

  return { add, addPrivate, loading, success };
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
        <div className="p-4 text-center bg-green-200">
          <div>😎</div>
          Success
          <button className="btn-light w-full mt-2 p-2" onClick={onReset}>
            OK
          </button>
        </div>
      );
    case "ERROR":
      return (
        <div className="p-4 text-center bg-red-100 text-red-500">
          <div>😵</div>
          Error
          {error && <div className="text-sm">{error}</div>}
          <button className="btn-red w-full mt-2 p-2" onClick={onReset}>
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
    // await delay(1000);
  };

  const reset = () => {
    setIsProcessing(false);
    setCid("");
    setPrivateCid("");
    setError("");
    setStatus("INITIAL");
  };

  const add = useCallback(
    async (fob: File | Blob | null) => {
      try {
        setIsProcessing(true);
        await updateStatus("PROCESSING");

        if (!fob) throw new Error("Please pick a file.");
        const cid = await ipfsCid(fob);
        setCid(cid);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.add(cid);
        await updateStatus("SENDING_IPFS");
        const remoteCid = await pinFile(fob);
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
    async (fob: File | Blob | null) => {
      try {
        setStatus("PROCESSING");
        setIsProcessing(true);
        if (!fob) throw new Error("Please pick a file.");

        // Create password
        await updateStatus("ENCRYPTING");
        const cid = await ipfsCid(fob);
        setCid(cid);
        const signer = provider.getSigner();
        const ps = await signer.signMessage(cid);

        // Encrypt
        const privateFob = await encryptFob(fob, ps);
        const privateCid = await ipfsCid(privateFob);
        setPrivateCid(privateCid);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.addPrivate(cid, privateCid);
        await updateStatus("SENDING_IPFS");
        const remotePrivateCid = await pinFile(privateFob);
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

  const verify = useCallback(async (fob: File | Blob | null, cid) => {
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
    reset,
  };
}

export function Drop() {
  const [fob, setFob] = useState<File | Blob | null>(null);
  const hashdrop = useHashDrop();

  return (
    <div className={`${styles.body} flex flex-col gap-4`}>
      <h1 className="font-bold">Drop</h1>

      <DataTabs onFobChange={setFob} />

      {/* <button
        className="pa2 w-100"
        disabled={!fob}
        onClick={() => hashdrop.add(fob)}
      >
        Add
      </button> */}
      {/* <div className="pt2" /> */}
      <button
        className="btn-blue p-2 w-full"
        disabled={!fob}
        onClick={() => hashdrop.addPrivate(fob)}
      >
        Add Private
      </button>
      {hashdrop.status !== "INITIAL" && (
        <Cover>
          <div className="bg-white border shadow-lg p-2 text-center w-full max-w-md">
            <StatusText
              status={hashdrop.status}
              error={hashdrop.error}
              onReset={() => {
                hashdrop.reset();
                setFob(null);
              }}
            />
            {hashdrop.status === "SUCCESS" && hashdrop.cid && (
              <div className="text-left">
                <div className="flex gap-2">
                  {/* https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent */}
                  <a
                    href={tweetUrl(hashdrop.cid)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tweet
                  </a>
                  <a
                    href={dropUrl(hashdrop.cid)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    See Drop
                  </a>
                  {process.env.NODE_ENV === "development" && (
                    <button
                      className="btn-red"
                      onClick={() =>
                        unpin(hashdrop.privateCid).then(() => {
                          alert("Unpin success!");
                          setFob(null);
                          hashdrop.reset();
                        })
                      }
                    >
                      Unpin
                    </button>
                  )}
                </div>
                <Cid cid={hashdrop.cid} />
              </div>
            )}
          </div>
        </Cover>
      )}
      <p>
        <a href="https://www.kalzumeus.com/essays/dropping-hashes">
          Dropping hashes: an idiom used to demonstrate provenance of documents
        </a>
      </p>
    </div>
  );
}
