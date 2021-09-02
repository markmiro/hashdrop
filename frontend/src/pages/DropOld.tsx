import { FC, useCallback, useEffect, useState } from "react";
import { Cid } from "../eth-react/Cid";
import { ipfsCid } from "../util/ipfsCid";
import { DataTabs } from "../components/DataTabs/DataTabs";
import aes from "crypto-js/aes";
import utf8Enc from "crypto-js/enc-utf8";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { fobAsDataUrl } from "../util/fobAsDataUrl";
import { textToBlob } from "../util/textToBlob";
import { DownloadButton } from "../components/DownloadButton";
import { UploadToIpfsButton } from "../components/UploadToIpfsButton";
import { EthHashDropSubmitButton } from "../components/EthHashDropSubmitButton";
import { cidToUrl } from "../util/pinata";
import styles from "../generic/styles.module.css";

const GrayBox: FC = ({ children }) => (
  <div className="block p-2 bg-black bg-opacity-5">{children}</div>
);

export function DropOld() {
  const provider = useEthersProvider();
  const [fob, setFob] = useState<File | Blob | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [localCid, setLocalCid] = useState("");

  // Encrypted
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [encrypted, setEncrypted] = useState<string | null>(null);
  const [encryptedFob, setEncryptedFob] = useState<File | Blob | null>(null);
  const [encryptedLocalCid, setEncryptedLocalCid] = useState("");

  const [downloadedEncrypted, setDownloadedEncrypted] = useState<string | null>(
    null
  );
  const [downloadedPrivateDataUrl, setDownloadedPrivateDataUrl] = useState<
    string | null
  >(null);

  const updateLocalCid = useCallback(async (fob: File | Blob | null) => {
    setFob(fob);
    if (!fob) {
      setLocalCid("");
      return;
    }
    try {
      const cid = await ipfsCid(fob);
      setLocalCid(cid);
      setGeneratedPassword("");
    } catch (err) {
      alert(err.message);
    }
  }, []);

  async function signCid() {
    const signedCid = await provider.getSigner().signMessage(localCid);
    console.log(signedCid);
    // alert(signed);
    setGeneratedPassword(signedCid);
  }

  useEffect(() => {
    if (!fob || !generatedPassword) {
      setDataUrl(null);
      setEncrypted(null);
      setEncryptedLocalCid("");
      return;
    }
    const doAsync = async () => {
      const dataUrl = await fobAsDataUrl(fob);
      setDataUrl(dataUrl);
      const encrypted = aes.encrypt(dataUrl, generatedPassword).toString();
      setEncrypted(encrypted);
      const encryptedFob = textToBlob(encrypted);
      setEncryptedFob(encryptedFob);
      const cid = await ipfsCid(encryptedFob);
      setEncryptedLocalCid(cid);
    };
    doAsync();
  }, [fob, generatedPassword]);

  const downloadEncryptedFile = async () => {
    const res = await fetch(cidToUrl(encryptedLocalCid));
    if (res.status === 404) {
      throw new Error("Not found");
    }
    const dEncrypted = await res.text();
    setDownloadedEncrypted(dEncrypted);

    const dataUrl = aes
      .decrypt(dEncrypted, generatedPassword)
      .toString(utf8Enc);
    setDownloadedPrivateDataUrl(dataUrl);
  };

  return (
    <div className={`${styles.body} space-y-4 py-4`}>
      <h2 className="text-2xl">Drop</h2>

      <div>
        <DataTabs onFobChange={updateLocalCid} />
        <GrayBox>
          <label>Local CID:</label>
          <Cid cid={localCid} />
        </GrayBox>
      </div>
      <button className="btn-blue p-2 w-full" onClick={signCid}>
        Sign CID
      </button>

      <h2 className="text-2xl">Encrypted</h2>

      <GrayBox>
        <div className="flex flex-col gap-2">
          <label>Signed CID / Generated Password:</label>
          <div className="font-mono text-xs break-all">
            {generatedPassword || "N/A"}
          </div>
          <label>Encrypted:</label>
          <div
            className="border bg-black bg-opacity-5 px-4 py-2 text-xs font-mono overflow-scroll break-all"
            style={{ height: "20vh" }}
          >
            {encrypted || "N/A"}
          </div>
          <label>Data URL:</label>
          <textarea
            className="break-all text-xs font-mono"
            readOnly
            value={dataUrl || "N/A"}
          />
          <div>
            <DownloadButton text={encrypted ?? ""} cid={encryptedLocalCid} />
          </div>
          <label>Local CID:</label>
          <Cid cid={encryptedLocalCid} />
        </div>
      </GrayBox>

      <UploadToIpfsButton
        fob={encryptedFob}
        onUpload={() => alert("Upload worked!")}
      >
        Upload Encrypted File
      </UploadToIpfsButton>

      <h2 className="text-2xl">Ethereum</h2>

      <div className="border p-2">
        <label>HashDrop.sol</label>
        <EthHashDropSubmitButton
          cid={localCid}
          privateCid={encryptedLocalCid}
          onSubmitComplete={() => alert("done!")}
        />
      </div>

      <h2 className="text-2xl">Download and show encrypted file</h2>
      <button className="btn-blue p-2 w-full" onClick={downloadEncryptedFile}>
        Download file
      </button>
      <GrayBox>
        <label>Encrypted:</label>
        <div
          className="p-4 bg-black bg-opacity-5 text-xs overflow-scroll break-all font-mono"
          style={{ height: "20vh" }}
        >
          {downloadedEncrypted || "N/A"}
        </div>
        <textarea
          className="w-full font-mono"
          readOnly
          value={downloadedPrivateDataUrl || "N/A"}
        />
      </GrayBox>
      {downloadedPrivateDataUrl && (
        <iframe
          width="100%"
          title="ipfs preview"
          className="block border"
          style={{ height: "20vh" }}
          src={downloadedPrivateDataUrl}
        />
      )}
    </div>
  );
}
