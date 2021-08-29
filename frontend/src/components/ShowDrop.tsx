import delay from "delay";
import { useCallback, useEffect, useState } from "react";
import { useContract } from "../eth-react/useContract";
import { Cid } from "../generic/Cid";
import { Loader } from "../generic/Loader";
import { cidToUrl, pinFile } from "../util/pinata";
import { HashDrop as T } from "../typechain/HashDrop";
import { decryptFileString } from "../util/encrypt";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { base64ToBlob } from "base64-blob";

function CheckOwner({ cid }: { cid: string }) {
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");
  const [loading, setLoading] = useState(false);
  const [privateCid, setPrivateCid] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hashdrop.contract) return;
    const doAsync = async () => {
      setLoading(true);
      await delay(500);
      const privateCid = await hashdrop.contract?.cidToPrivateCid(cid);

      // This means the cid doesn't have a private file associated with it
      if (!privateCid) {
        setLoading(false);
        return;
      }
      setPrivateCid(privateCid);

      const res = await fetch(cidToUrl(privateCid));
      if (res.status === 404) {
        setLoading(false);
        throw new Error("Not found");
      }
      const encrypted = await res.text();
      const signer = provider.getSigner();
      const ps = await signer.signMessage(cid);
      const dataUrl = await decryptFileString(encrypted, ps);
      setDataUrl(dataUrl);
      setLoading(false);
    };
    doAsync();
  }, [provider, cid, !!hashdrop.contract]);

  const publish = async (dataUrl: string) => {
    const fileOrBlob = await base64ToBlob(dataUrl);
    const remoteCid = await pinFile(fileOrBlob, { name: "decrypted" });
    if (remoteCid === cid) {
      alert("Success!");
      window.location.reload();
    } else {
      alert("Failed!");
    }
  };

  if (loading) return <Loader>Private CID</Loader>;

  return (
    <div>
      Private CID: {privateCid ? <Cid cid={privateCid} /> : "N/A"}
      {dataUrl && (
        <div>
          <iframe
            width="100%"
            title="ipfs preview"
            className="db ba"
            style={{ height: "20vh" }}
            src={dataUrl}
          />
          <button className="w-100 pa2" onClick={() => publish(dataUrl)}>
            Publish File
          </button>
        </div>
      )}
    </div>
  );
}

export function ShowDrop({ cid }: { cid: string }) {
  const [loading, setLoading] = useState(false);
  const [cidPublished, setCidPublished] = useState(false);

  const checkWantedCid = useCallback(async (cid) => {
    try {
      setLoading(true);
      await delay(1000);
      // TODO: add timeout with a try again button
      const res = await fetch(cidToUrl(cid));
      if (res.status === 404) {
        throw new Error("Not found");
      }
      setCidPublished(true);
      setLoading(false);
    } catch (err) {
      setCidPublished(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset `cidPublished` so UI waits until API comes back with success before trying to show the file.
    setCidPublished(false);
    checkWantedCid(cid);
  }, [cid, checkWantedCid]);

  return (
    <div>
      <h1>Show Drop</h1>
      <div>
        <Cid cid={cid} />
      </div>
      {cidPublished ? (
        <>
          {/* TODO: show date of decrypted file? If encrypted file shows up in
            plaintext then it's because your hashdrop was already dropped by
            someone else. */}
          <iframe
            width="100%"
            title="ipfs preview"
            className="db ba"
            style={{ height: "20vh" }}
            src={cidToUrl(cid)}
          />
        </>
      ) : loading ? (
        <Loader />
      ) : (
        <>
          <div className="ba bg-washed-yellow orange pa3 tc">
            <h2 className="mv0 b f5">
              File for hash not published, or file published but cannot be
              found.
            </h2>
            <div className="pt2" />
            <p className="mv0">
              If you're the one who created the hash above, publish the file
              using something like <a href="https://pinata.cloud/">Pinata</a>{" "}
              once you're ready to share your secret message with the world.
            </p>
          </div>
          <CheckOwner cid={cid} />
        </>
      )}
    </div>
  );
}
