import aes from "crypto-js/aes";
import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { DataTabs } from "../components/DataTabs";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { HashDrop as T } from "../typechain";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile } from "../util/pinata";
import { textToBlob } from "../util/textToBlob";

function useAdd() {
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const add = useCallback(
    async ({ id, cid }: { id: string; cid: string }) => {
      setSuccess(false);
      setError("");
      setLoading(true);
      if (!hashdrop.contract) throw new Error("Contract isn't set yet");
      try {
        const signer = provider.getSigner();
        const tx = await hashdrop.contract.connect(signer).add({ id, cid });
        await tx.wait();
        setSuccess(true);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    },
    [provider, hashdrop]
  );

  return { add, error, loading, success };
}

async function encryptFileOrBlob(fileOrBlob: File | Blob, password: string) {
  const dataUrl = await fileOrBlobAsDataUrl(fileOrBlob);
  const encrypted = aes.encrypt(dataUrl, password).toString();
  const pFileOrBlob = textToBlob(encrypted);
  return pFileOrBlob;
}

function useHashDrop() {
  const provider = useEthersProvider();
  const ethAdd = useAdd();

  const add = useCallback(
    async (fileOrBlob: File | Blob | null) => {
      if (!fileOrBlob) throw new Error("Please pick a file.");
      const dropId = uuid();
      const cid = await ipfsCid(fileOrBlob);

      // Save / upload
      await ethAdd.add({ cid, id: dropId });
      const remoteCid = await pinFile(fileOrBlob);
      if (cid !== remoteCid) throw new Error("Internal error.");
    },
    [ethAdd]
  );

  const addPrivate = useCallback(
    async (fileOrBlob: File | Blob | null) => {
      if (!fileOrBlob) throw new Error("Please pick a file.");

      // Create password
      const dropId = uuid();
      const ps = await provider.getSigner().signMessage(dropId);

      // Encrypt
      const privateFileOrBlob = await encryptFileOrBlob(fileOrBlob, ps);
      const privateCid = await ipfsCid(privateFileOrBlob);

      // Save / upload
      await ethAdd.add({ cid: privateCid, id: dropId });
      const remotePrivateCid = await pinFile(privateFileOrBlob);
      if (privateCid !== remotePrivateCid) throw new Error("Internal error.");
    },
    [provider, ethAdd]
  );

  const verify = useCallback(async (fileOrBlob: File | Blob | null, cid) => {
    throw new Error("TODO: implement");
  }, []);

  return { add, addPrivate, verify };
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
      <button
        className="pa2 w-100"
        disabled={!fileOrBlob}
        onClick={() => hashdrop.add(fileOrBlob).then(() => alert("Success!"))}
      >
        Add
      </button>
      <div className="pt2" />
      <button
        className="pa2 w-100"
        disabled={!fileOrBlob}
        onClick={() =>
          hashdrop.addPrivate(fileOrBlob).then(() => alert("Success!"))
        }
      >
        Add Private
      </button>
    </div>
  );
}
