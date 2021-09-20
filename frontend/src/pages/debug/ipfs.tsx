import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { useState } from "react";
import { Cid } from "../../eth-react/Cid";
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
