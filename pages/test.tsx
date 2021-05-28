import sha256 from "crypto-js/sha256";
const Hash = require("ipfs-only-hash");
import { useCallback, useEffect, useState } from "react";

const CID = require("cids");
const multihashing = require("multihashing-async");

const helloFileHash =
  "bafybeid3weurg3gvyoi7nisadzolomlvoxoppe2sesktnpvdve3256n5tq";

const cid = new CID(helloFileHash);
console.log(cid);
const helloText = "hello";

export default function Test() {
  const [helloTextHash, setHelloTextHash] = useState("");
  const [helloTextHash2, setHelloTextHash2] = useState("");

  const textToHash = useCallback(async () => {
    const bytes = new TextEncoder().encode(helloText);
    const hash = await multihashing(bytes, "sha2-256");
    const cid = new CID(1, "dag-pb", hash);
    setHelloTextHash(cid.toString());

    const ipfsTextHash = await Hash.of(helloText, { cidVersion: 1 });
    setHelloTextHash2(ipfsTextHash);
  }, []);

  useEffect(() => {
    textToHash();
    fetch("/hello.txt")
      .then((res) => res.blob())
      .then(async (res) => {
        console.log({ res: res.arrayBuffer() });
        const bytes = await res.arrayBuffer();
        // const bytes = new TextEncoder().encode(res);
        const hash = await multihashing(bytes, "sha2-256");
        const cid = new CID(1, "dag-pb", hash);
        alert(cid.toString());
      });
  }, []);

  return (
    <div>
      {helloTextHash}
      <br />
      {helloTextHash2}
      <br />
      {sha256(helloText).toString()}
      <iframe
        src={`https://${helloTextHash2}.ipfs.dweb.link`}
        width="100%"
        height="500px"
        style={{ border: "1px solid red" }}
      />
      {helloFileHash}
      {}
      <iframe
        src={`https://${helloFileHash}.ipfs.dweb.link`}
        width="100%"
        height="500px"
        style={{ border: "1px solid red" }}
      />
    </div>
  );
}
