import { Box, Button, ButtonGroup, Input, Textarea } from "@chakra-ui/react";
import aes from "crypto-js/aes";
import { ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import { MonoText } from "../../generic/MonoText";
import { fobAsDataUrl } from "../../util/fobAsDataUrl";

const id = ethers.utils.hexlify(ethers.utils.randomBytes(12));

const Data: FC = ({ children }) => (
  <Box maxH="20vh" overflow="scroll" fontSize="xs">
    <MonoText>{children || "N/A"}</MonoText>
  </Box>
);

// https://stackoverflow.com/a/20285053
const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(fobAsDataUrl);

export function Encrypt() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("Hello");
  const [enc, setEnc] = useState("");

  useEffect(() => {
    const enc = aes.encrypt(message, id).toString();
    setEnc(enc);
  }, [message]);

  useEffect(() => {
    console.log(url);
    toDataURL(url).then((dataUrl) => {
      setMessage(dataUrl);
    });
  }, [url]);

  return (
    <>
      <label>ID</label>
      <Input disabled readOnly value={id} />

      <label>URL</label>
      <Input value={url} onChange={(e) => setUrl(e.target.value)} />

      <ButtonGroup>
        <Button onClick={() => setUrl("./examples/file.txt")}>file.txt</Button>
        <Button onClick={() => setUrl("./examples/bitcoin.pdf")}>
          bitcoin.pdf
        </Button>
        <Button onClick={() => setUrl("./examples/molecule.svg")}>
          molecule.svg
        </Button>
      </ButtonGroup>

      <label>Message</label>
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />

      <Box fontSize="xs" textAlign="right" opacity={0.5} fontFamily="mono">
        <div>Message length: {message.length}</div>
        <div>Encrypted length: {enc.length}</div>
        <div>
          Difference: {Math.round((enc.length / message.length) * 100)}%
        </div>
      </Box>

      <iframe title="content" src={url} width="100%" className="border" />

      <label>Encrypted</label>

      <Data>{enc || "N/A"}</Data>
    </>
  );
}
