import { FC, useCallback, useEffect, useState } from "react";
import { Cid } from "../../eth-react/Cid";
import { ipfsCid } from "../../util/ipfsCid";
import { DataTabs } from "../../components/DataTabs/DataTabs";
import aes from "crypto-js/aes";
import utf8Enc from "crypto-js/enc-utf8";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";
import { fobAsDataUrl } from "../../util/fobAsDataUrl";
import { textToBlob } from "../../util/textToBlob";
import { DownloadButton } from "../../components/DownloadButton";
import { UploadToIpfsButton } from "../../components/UploadToIpfsButton";
import { EthHashDropSubmitButton } from "../../components/EthHashDropSubmitButton";
import { cidToUrl } from "../../util/pinata";
import { IFramePreview } from "../../components/IFramePreview";
import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import { MonoText } from "../../generic/MonoText";

const GrayBox: FC = ({ children }) => (
  <Box p={2} background="blackAlpha.100">
    <VStack spacing={2} align="stretch">
      {children}
    </VStack>
  </Box>
);

const Data: FC = ({ children }) => (
  <Box maxH="20vh" overflow="scroll" fontSize="xs">
    <MonoText>{children || "N/A"}</MonoText>
  </Box>
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
    <VStack spacing={8} align="stretch">
      <div>
        <DataTabs onFobChange={updateLocalCid} />
        <GrayBox>
          <label>Local CID:</label>
          <Cid cid={localCid} />
        </GrayBox>
      </div>

      <Button colorScheme="blue" onClick={signCid}>
        Sign CID
      </Button>

      <Heading as="h3" fontSize="2xl">
        Encrypted
      </Heading>

      <GrayBox>
        <label>Signed CID / Generated Password:</label>
        <Data>{generatedPassword}</Data>
        <label>Encrypted:</label>
        <Data>{encrypted}</Data>
        <label>Data URL:</label>
        <Data>{dataUrl}</Data>
        <DownloadButton text={encrypted ?? ""} cid={encryptedLocalCid} />
        <label>Local CID:</label>
        <Cid cid={encryptedLocalCid} />
      </GrayBox>

      <UploadToIpfsButton
        fob={encryptedFob}
        onUpload={() => alert("Upload worked!")}
      >
        Upload Encrypted File
      </UploadToIpfsButton>

      <Heading as="h3" fontSize="2xl">
        Ethereum
      </Heading>

      <Box p={2} borderWidth={1}>
        <label>HashDrop.sol</label>
        <EthHashDropSubmitButton
          cid={localCid}
          privateCid={encryptedLocalCid}
          onSubmitComplete={() => alert("done!")}
        />
      </Box>

      <Heading as="h3" fontSize="2xl">
        Download and show encrypted file
      </Heading>

      <Button colorScheme="blue" onClick={downloadEncryptedFile}>
        Download file
      </Button>

      <GrayBox>
        <label>Encrypted:</label>
        <Data>{downloadedEncrypted}</Data>
        <Data>{downloadedPrivateDataUrl}</Data>
      </GrayBox>
      {downloadedPrivateDataUrl && (
        <Box borderWidth={1}>
          <IFramePreview src={downloadedPrivateDataUrl} />
        </Box>
      )}
    </VStack>
  );
}
