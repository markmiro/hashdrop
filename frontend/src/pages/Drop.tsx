import { FC, useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Cid } from "../generic/Cid";
import { ipfsCid } from "../util/ipfsCid";
import { DataTabs } from "../components/DataTabs";
import aes from "crypto-js/aes";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { fileOrBlobAsDataUrl } from "../util/fileOrBlobAsDataUrl";
import { textToBlob } from "../util/textToBlob";
import { DownloadButton } from "../components/DownloadButton";
import { UploadToIpfsButton } from "../components/UploadToIpfsButton";
import { EthHashDropSubmitButton } from "../components/EthHashDropSubmitButton";

const GrayBox: FC = ({ children }) => (
  <div className="db pa2 bg-black-05">{children}</div>
);

export function Drop() {
  const provider = useEthersProvider();
  const [fileOrBlob, setFileOrBlob] = useState<File | Blob | null>(null);
  const [dropId, setDropId] = useState("");
  const [localCid, setLocalCid] = useState("");

  // Encrypted
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [encrypted, setEncrypted] = useState<string | null>(null);
  const [encryptedFileOrBlob, setEncryptedFileOrBlob] = useState<
    File | Blob | null
  >(null);
  const [encryptedLocalCid, setEncryptedLocalCid] = useState("");

  useEffect(() => {
    setDropId(uuid());
  }, []);

  const updateLocalCid = useCallback(async (fileOrBlob: File | Blob | null) => {
    setFileOrBlob(fileOrBlob);
    if (!fileOrBlob) {
      setLocalCid("");
      return;
    }
    try {
      const cid = await ipfsCid(fileOrBlob);
      setLocalCid(cid);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  async function signDropId() {
    console.log(dropId);
    const signed = await provider.getSigner().signMessage(dropId);
    console.log(signed);
    // alert(signed);
    setGeneratedPassword(signed);
  }

  useEffect(() => {
    if (!fileOrBlob || !generatedPassword) {
      setEncrypted(null);
      return;
    }
    const doAsync = async () => {
      const dataUrl = await fileOrBlobAsDataUrl(fileOrBlob);
      const encrypted = aes.encrypt(dataUrl, generatedPassword).toString();
      setEncrypted(encrypted);
      const encryptedFileOrBlob = textToBlob(encrypted);
      setEncryptedFileOrBlob(encryptedFileOrBlob);
      const cid = await ipfsCid(encryptedFileOrBlob);
      setEncryptedLocalCid(cid);
    };
    doAsync();
  }, [fileOrBlob, generatedPassword]);

  return (
    <div>
      <div className="pt4" />
      <h1 className="mv0">Drop</h1>
      <div className="pt4" />
      <DataTabs onFileOrBlobChange={updateLocalCid} />
      <GrayBox>
        Local CID:
        <Cid cid={localCid} />
        Drop ID:
        <div>{dropId}</div>
      </GrayBox>
      <div className="pt4" />
      <button onClick={signDropId}>Sign Drop Id</button>
      <div className="pt4" />
      <h2 className="mv0">Encrypted</h2>
      <div className="pt4" />
      <GrayBox>
        Signed Drop ID / Generated Password:
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
        <div>
          <DownloadButton text={encrypted ?? ""} cid={encryptedLocalCid} />
        </div>
        Local CID:
        <Cid cid={encryptedLocalCid} />
      </GrayBox>
      <div className="pt4" />
      <UploadToIpfsButton fileOrBlob={encryptedFileOrBlob}>
        Upload Encrypted File
      </UploadToIpfsButton>
      <div className="pt4" />
      <h2 className="mv0">Ethereum</h2>
      <div className="pt4" />
      <b>HashDrop.sol</b>
      <EthHashDropSubmitButton
        id={dropId}
        cid={encryptedLocalCid}
        onSubmitComplete={() => alert("done!")}
      />
    </div>
  );
}
