import { FC, useCallback, useEffect, useState } from "react";
import { Cid } from "../generic/Cid";
import { ipfsCid } from "../util/ipfsCid";
import { DataTabs } from "../components/DataTabs/DataTabs";
import aes from "crypto-js/aes";
import utf8Enc from "crypto-js/enc-utf8";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";
import { textToBlob } from "../util/textToBlob";
import { DownloadButton } from "../components/DownloadButton";
import { UploadToIpfsButton } from "../components/UploadToIpfsButton";
import { EthHashDropSubmitButton } from "../components/EthHashDropSubmitButton";
import { cidToUrl } from "../util/pinata";

const GrayBox: FC = ({ children }) => (
  <div className="db pa2 bg-black-05">{children}</div>
);

export function DropOld() {
  const provider = useEthersProvider();
  const [fileOrBlob, setFileOrBlob] = useState<File | Blob | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [localCid, setLocalCid] = useState("");

  // Encrypted
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [encrypted, setEncrypted] = useState<string | null>(null);
  const [encryptedFileOrBlob, setEncryptedFileOrBlob] = useState<
    File | Blob | null
  >(null);
  const [encryptedLocalCid, setEncryptedLocalCid] = useState("");

  const [downloadedEncrypted, setDownloadedEncrypted] = useState<string | null>(
    null
  );
  const [downloadedPrivateDataUrl, setDownloadedPrivateDataUrl] = useState<
    string | null
  >(null);

  const updateLocalCid = useCallback(async (fileOrBlob: File | Blob | null) => {
    setFileOrBlob(fileOrBlob);
    if (!fileOrBlob) {
      setLocalCid("");
      return;
    }
    try {
      const cid = await ipfsCid(fileOrBlob);
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
    if (!fileOrBlob || !generatedPassword) {
      setDataUrl(null);
      setEncrypted(null);
      setEncryptedLocalCid("");
      return;
    }
    const doAsync = async () => {
      const dataUrl = await fileOrBlobAsDataUrl(fileOrBlob);
      setDataUrl(dataUrl);
      const encrypted = aes.encrypt(dataUrl, generatedPassword).toString();
      setEncrypted(encrypted);
      const encryptedFileOrBlob = textToBlob(encrypted);
      setEncryptedFileOrBlob(encryptedFileOrBlob);
      const cid = await ipfsCid(encryptedFileOrBlob);
      setEncryptedLocalCid(cid);
    };
    doAsync();
  }, [fileOrBlob, generatedPassword]);

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
    <div>
      <div className="pt4" />
      <h1 className="mv0">Drop</h1>
      <div className="pt4" />
      <DataTabs onFileOrBlobChange={updateLocalCid} />
      <GrayBox>
        Local CID:
        <Cid cid={localCid} />
      </GrayBox>
      <div className="pt4" />
      <button onClick={signCid}>Sign CID</button>
      <div className="pt4" />
      <h2 className="mv0">Encrypted</h2>
      <div className="pt4" />
      <GrayBox>
        Signed CID / Generated Password:
        <div style={{ wordBreak: "break-all" }}>
          {generatedPassword || "N/A"}
        </div>
        Encrypted:
        <div
          className="f7 h4 overflow-scroll ba"
          style={{ wordBreak: "break-all" }}
        >
          {encrypted || "N/A"}
        </div>
        <textarea readOnly value={dataUrl || "N/A"} />
        <div>
          <DownloadButton text={encrypted ?? ""} cid={encryptedLocalCid} />
        </div>
        Local CID:
        <Cid cid={encryptedLocalCid} />
      </GrayBox>
      <div className="pt4" />
      <UploadToIpfsButton
        fileOrBlob={encryptedFileOrBlob}
        onUpload={() => alert("Upload worked!")}
      >
        Upload Encrypted File
      </UploadToIpfsButton>
      <div className="pt4" />
      <h2 className="mv0">Ethereum</h2>
      <div className="pt4" />
      <b>HashDrop.sol</b>
      <EthHashDropSubmitButton
        cid={localCid}
        privateCid={encryptedLocalCid}
        onSubmitComplete={() => alert("done!")}
      />
      <div className="pt4" />
      <h2 className="mv0">Download and show encrypted file</h2>
      <button onClick={downloadEncryptedFile}>Download file</button>
      <GrayBox>
        Encrypted:
        <div
          className="f7 h4 overflow-scroll ba"
          style={{ wordBreak: "break-all" }}
        >
          {downloadedEncrypted || "N/A"}
        </div>
        <textarea readOnly value={downloadedPrivateDataUrl || "N/A"} />
      </GrayBox>
      {downloadedPrivateDataUrl && (
        <iframe
          width="100%"
          title="ipfs preview"
          className="db ba"
          style={{ height: "20vh" }}
          src={downloadedPrivateDataUrl}
        />
      )}
      <div className="pt4" />

      <div className="pt4" />
      <h2 className="mv0">TODO: Show decrypted file</h2>
      <div className="pt4" />
    </div>
  );
}
