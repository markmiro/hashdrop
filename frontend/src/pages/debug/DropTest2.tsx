import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Link, VStack } from "@chakra-ui/layout";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Cid } from "../../eth-react/Cid";
import {
  blobToCid,
  blobToDataUrl,
  pinBlob,
  textToBlob,
  useEncrypter,
} from "../../util/dropUtils";

export function DropTest2() {
  const [message, setMessage] = useState(`Test message: ${new Date()}`);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [cid, setCid] = useState("");
  const [encCid, setEncCid] = useState("");
  const encrypter = useEncrypter();

  const reset = () => {
    setDataUrl("");
    setEncCid("");
  };

  const pinEncryptedText = async () => {
    reset();
    // console.log({ message });
    const blob = textToBlob(message);
    // console.log({ blob });
    const dataUrl = await blobToDataUrl(blob);
    setDataUrl(dataUrl);

    const cid = await blobToCid(blob);
    setCid(cid);

    // console.log({ bs: dataUrl });
    const encrypted = await encrypter.encrypt(blob);
    // console.log({ encrypted });

    const encCid = await pinBlob(textToBlob(encrypted));
    setEncCid(encCid);
  };

  return (
    <VStack spacing={2} align="start">
      <Input value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={pinEncryptedText}>Pin encrypted on Pinata</Button>
      <div>
        ENC CID: <Cid cid={encCid} />
      </div>
      <div>
        PUB CID: <Cid cid={cid} />
      </div>
      <Link as={RouterLink} to={`/debug/drops/${cid}?encCid=${encCid}`}>
        Drop It
      </Link>
      <iframe
        style={{ border: "1px solid" }}
        title="dataUrl"
        src={dataUrl}
        width="100%"
        height="300px"
      />
    </VStack>
  );
}
