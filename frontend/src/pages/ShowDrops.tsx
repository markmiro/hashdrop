import { Button } from "@chakra-ui/react";
import axios from "axios";
import delay from "delay";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { AddressLink } from "../eth-react/AddressLink";
import { Cid } from "../eth-react/Cid";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { useMetaMaskEthereum } from "../eth-react/useMetaMaskEthereum";
import { Loader } from "../generic/Loader";
import { User as T } from "../typechain";
import { ipfsCid } from "../util/ipfsCid";
import { cidToUrl, pinFile } from "../util/pinata";
import { textToBlob } from "../util/textToBlob";

export function ShowDrops() {
  const [loading, setLoading] = useState(true);
  const drops = useContract<T>("User");
  const [rootCid, setRootCid] = useState<string | undefined>();
  const { data } = useMetaMaskEthereum();
  const provider = useEthersProvider();

  useEffect(() => {
    const doAsync = async () => {
      if (!data.selectedAddress) return;
      setLoading(true);
      await delay(500);
      if (!drops.contract) {
        debugger;
        setLoading(false);
      }
      const rootCid = await drops.contract?.addressToRootCid(
        data.selectedAddress
      );
      setRootCid(rootCid);
      setLoading(false);
    };
    doAsync();
  }, [drops.contract, data.selectedAddress]);

  useEffect(() => {
    if (!rootCid) return;
    axios.get(cidToUrl(rootCid)).then((res) => {
      debugger;
      console.log(res.data);
    });
  }, [rootCid]);

  const defaultJson = {
    address: data.selectedAddress,
    drops: [],
  };

  const publishRoot = async () => {
    if (!drops.contract) {
      alert("no contract");
      return;
    }
    const blob = textToBlob(JSON.stringify(defaultJson));
    const cid = await ipfsCid(blob);
    const tx = await drops.contract.connect(provider.getSigner()).set(cid);
    await tx.wait();

    const remoteCid = await pinFile(blob, { name: "root-cid" });
    if (cid !== remoteCid) {
      alert("Remote and local cid don't match");
      return;
    }
    alert("success");
  };

  if (loading) return <Loader>Fetching your drops</Loader>;

  return (
    <>
      <ReactJson src={defaultJson} />
      <Button onClick={publishRoot}>Publish root</Button>
      <AddressLink address={drops.contract?.address} />
      <Cid cid={rootCid} />
    </>
  );
}
