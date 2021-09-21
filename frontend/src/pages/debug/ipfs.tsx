import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { base64ToBlob } from "base64-blob";
import delay from "delay";
import { useState } from "react";
import { Cid } from "../../eth-react/Cid";
import { decryptFileString, encryptFob } from "../../util/encrypt";
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
      debugger;
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
    const fob = textToBlob(message);
    const ps = "whatever";
    const privateFob = await encryptFob(fob, ps);
    const privateCid = await ipfsCid(privateFob);
    setCid(privateCid);
    const remoteCid = await pinFile(privateFob);
    if (privateCid !== remoteCid) {
      return new Error("File drop: Local and remote CID don't match.");
    }

    try {
      const res = await axios.get(cidToUrl(privateCid));
      if (res.status === 404) {
        return new Error(`Encrypted file with CID ${privateCid} not found.`);
      }
      const encrypted = await res.data;
      const dataUrl = await decryptFileString(encrypted, ps);
      const fob2 = await base64ToBlob(dataUrl);
      const remoteText = await fobAsText(fob2);
      setRemoteMessage(remoteText);
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
