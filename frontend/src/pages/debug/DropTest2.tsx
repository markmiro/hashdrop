import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Link, VStack } from "@chakra-ui/layout";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Cid } from "../../eth-react/Cid";
import { blobAsDataUrl, encrypt, textToBlob } from "../../util/dropUtils";
import { pinFile } from "../../util/pinata";

export function DropTest2() {
  const [message, setMessage] = useState(`Test message: ${new Date()}`);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [cid, setCid] = useState("");
  const [encCid, setEncCid] = useState("");

  const reset = () => {
    setDataUrl("");
    setEncCid("");
  };

  const pinEncryptedText = async () => {
    reset();
    // console.log({ message });
    const blob = textToBlob(message);
    // console.log({ blob });
    const dataUrl = await blobAsDataUrl(blob);
    setDataUrl(dataUrl);
    // console.log({ bs: dataUrl });
    const encrypted = encrypt(dataUrl);
    // console.log({ encrypted });

    const encCid = await pinFile(textToBlob(encrypted));
    setEncCid(encCid);
  };

  return (
    <VStack spacing={2} align="start">
      <Input value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={pinEncryptedText}>Pin encrypted on Pinata</Button>
      <Cid cid={encCid} />
      <Link as={RouterLink} to={`/debug/drops/${encCid}`}>
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
