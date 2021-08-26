import aes from "crypto-js/aes";
import delay from "delay";
import { FC, useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { DataTabs } from "../components/DataTabs";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { Loader } from "../generic/Loader";
import { Disabled } from "../generic/Disabled";
import { HashDrop as T } from "../typechain";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile } from "../util/pinata";
import { textToBlob } from "../util/textToBlob";

function useAdd() {
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const add = useCallback(
    async ({ id, cid }: { id: string; cid: string }) => {
      setSuccess(false);
      setLoading(true);
      if (!hashdrop.contract) throw new Error("Contract isn't set yet");

      const signer = provider.getSigner();
      const tx = await hashdrop.contract.connect(signer).add({ id, cid });
      await tx.wait();
      setSuccess(true);

      setLoading(false);
    },
    [provider, hashdrop]
  );

  return { add, loading, success };
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
        setStatus("INITIAL");
        if (!fileOrBlob) throw new Error("Please pick a file.");
        const dropId = uuid();
        await updateStatus("PROCESSING");
        const cid = await ipfsCid(fileOrBlob);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.add({ cid, id: dropId });
        await updateStatus("SENDING_IPFS");
        const remoteCid = await pinFile(fileOrBlob);
        if (cid !== remoteCid) throw new Error("Internal error.");
        await updateStatus("SUCCESS");
      } catch (err) {
        setStatus("ERROR");
        setError(err.message);
        throw new Error(err);
      }
    },
    [ethAdd]
  );

  const addPrivate = useCallback(
    async (fileOrBlob: File | Blob | null) => {
      try {
        setStatus("INITIAL");
        if (!fileOrBlob) throw new Error("Please pick a file.");

        // Create password
        await updateStatus("ENCRYPTING");
        const dropId = uuid();
        const ps = await provider.getSigner().signMessage(dropId);

        // Encrypt
        const privateFileOrBlob = await encryptFileOrBlob(fileOrBlob, ps);
        const privateCid = await ipfsCid(privateFileOrBlob);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.add({ cid: privateCid, id: dropId });
        await updateStatus("SENDING_IPFS");
        const remotePrivateCid = await pinFile(privateFileOrBlob);
        if (privateCid !== remotePrivateCid) throw new Error("Internal error.");
        setStatus("SUCCESS");
      } catch (err) {
        setStatus("ERROR");
        setError(err.message);
        throw new Error(err);
      }
    },
    [provider, ethAdd]
  );

  const verify = useCallback(async (fileOrBlob: File | Blob | null, cid) => {
    throw new Error("TODO: implement");
  }, []);

  return { add, addPrivate, verify, status, isProcessing, error, resetStatus };
}

export function Drop() {
  const [fileOrBlob, setFileOrBlob] = useState<File | Blob | null>(null);
  const hashdrop = useHashDrop();

  return (
    <div>
      <div className="pt4" />
      <h1 className="mv0">Drop</h1>
      <div className="pt4" />
      <Disabled disabled={hashdrop.isProcessing}>
        <DataTabs onFileOrBlobChange={setFileOrBlob} />
        <div className="pt4" />
        <button
          className="pa2 w-100"
          disabled={!fileOrBlob}
          onClick={() => hashdrop.add(fileOrBlob)}
        >
          Add
        </button>
        <div className="pt2" />
        <button
          className="pa2 w-100"
          disabled={!fileOrBlob}
          onClick={() => hashdrop.addPrivate(fileOrBlob)}
        >
          Add Private
        </button>
      </Disabled>
      <div className="pt2" />
      <div className="tc">
        <StatusText
          status={hashdrop.status}
          error={hashdrop.error}
          onReset={hashdrop.resetStatus}
        />
      </div>
    </div>
  );
}
