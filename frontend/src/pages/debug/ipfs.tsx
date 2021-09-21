import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { base64ToBlob } from "base64-blob";
import aes from "crypto-js/aes";
import utf8Enc from "crypto-js/enc-utf8";
import delay from "delay";
import { useState } from "react";
import { Cid } from "../../eth-react/Cid";
import { fobAsDataUrl } from "../../util/fobAsDataUrl";
import { fobAsText } from "../../util/fobAsText";
import { ipfsCid } from "../../util/ipfsCid";
import { cidToUrl, pinFile } from "../../util/pinata";
import { textToBlob } from "../../util/textToBlob";

export function Ipfs() {
  const [cid, setCid] = useState("");
  const [message, setMessage] = useState("");
  const [remoteMessage, setRemoteMessage] = useState<any>("");
  const [loading, setLoading] = useState(false);

  const doIt = async () => {
    setLoading(true);
    setMessage("");
    setRemoteMessage("");
    setCid("");

    await delay(500);

    const message = `Test message: ${new Date()}`;
    setMessage(message);
    const fob = textToBlob(message);
    const cid = await ipfsCid(fob);
    const remoteCid = await pinFile(fob);
    if (cid !== remoteCid) {
      return new Error("Local and remote CID don't match.");
    }
    setCid(cid);
    try {
      const res = await axios.get(cidToUrl(cid));
      setRemoteMessage(res.data);
    } catch (err) {
      setRemoteMessage(err);
    }
    setLoading(false);
  };

  return (
    <VStack spacing={2} align="stretch">
      <Button onClick={doIt} isLoading={loading}>
        Upload and Retrieve
      </Button>
      {message && <Input defaultValue={message} isReadOnly />}
      {message && <Input defaultValue={remoteMessage} isReadOnly />}
      <Cid cid={cid} />
    </VStack>
  );
}

export function Ipfs2() {
  const [cid, setCid] = useState("");
  const [message, setMessage] = useState("");
  const [remoteMessage, setRemoteMessage] = useState<any>("");
  const [loading, setLoading] = useState(false);

  const doIt = async () => {
    setLoading(true);
    setMessage("");
    setRemoteMessage("");
    setCid("");

    await delay(500);

    const message = `Test message: ${new Date()}`;
    setMessage(message);
    const ps = "whatever";
    const fob = textToBlob(message);
    const dataUrl = await fobAsDataUrl(fob);
    const encrypted = aes.encrypt(dataUrl, ps).toString();

    const dataUrl2 = aes.decrypt(encrypted, ps).toString(utf8Enc);
    const fob2 = await base64ToBlob(dataUrl2);
    const message2 = await fobAsText(fob2);

    const cid2 = await pinFile(fob2);
    setCid(cid2);

    try {
      const res = await axios.get(cidToUrl(cid2));
      if (res.status === 404) {
        return new Error(`Encrypted file with CID ${cid2} not found.`);
      }
      setRemoteMessage(message2);
    } catch (err) {
      setRemoteMessage(err);
    }

    setLoading(false);
  };

  return (
    <VStack spacing={2} align="stretch">
      <Button onClick={doIt} isLoading={loading}>
        Upload and Retrieve
      </Button>
      {message && <Input defaultValue={message} isReadOnly />}
      {message && <Input defaultValue={remoteMessage} isReadOnly />}
      <Cid cid={cid} />
    </VStack>
  );
}
