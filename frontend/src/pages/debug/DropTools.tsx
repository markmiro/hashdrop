import { Button, ButtonGroup } from "@chakra-ui/react";
import axios from "axios";
import delay from "delay";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { createUserJson } from "../../util/UserJson";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";
import { useContract } from "../../eth-react/useContract";
import { useMetaMaskEthereum } from "../../eth-react/useMetaMaskEthereum";
import { Loader } from "../../generic/Loader";
import { Drops as DropsT } from "../../typechain";
import { ipfsCid } from "../../util/ipfsCid";
import { cidToUrl, pinFile } from "../../util/pinata";
import { textToBlob } from "../../util/textToBlob";

export function DropTools() {
  const { data } = useMetaMaskEthereum();
  const provider = useEthersProvider();
  const drops = useContract<DropsT>("Drops");
  const [userJson, setUserJson] = useState<object | null | "loading">(null);

  useEffect(() => {
    const doAsync = async () => {
      setUserJson("loading");
      debugger;
      if (!drops.contract) return new Error("No 'Drops smart contract");
      if (!data.selectedAddress) return new Error("No address selected");

      const userAddress = data.selectedAddress;
      const userCid = await drops.contract.addressToRootCid(userAddress);
      const userJson = userCid
        ? (await axios.get<object>(cidToUrl(userCid))).data
        : createUserJson(userAddress);
      await delay(200);
      setUserJson(userJson);
    };
    doAsync();
  }, [drops.contract, data.selectedAddress]);

  const resetJson = async () => {
    if (!drops.contract) return new Error("No 'Drops smart contract");
    if (!data.selectedAddress) return new Error("No address selected");
    const json = createUserJson(data.selectedAddress);
    console.log(json);
    const jsonStr = JSON.stringify(json);
    const fob = textToBlob(jsonStr);
    const cid = await ipfsCid(fob);
    const remoteCid = await pinFile(fob);
    if (cid !== remoteCid) throw new Error("CID and remote CID don't match.");
    const signer = provider.getSigner();
    const tx = await drops.contract.connect(signer).set(cid);
    await tx.wait();
    alert("Done resetting");
  };

  return (
    <div>
      <ButtonGroup>
        <Button onClick={resetJson}>Reset JSON</Button>
      </ButtonGroup>
      {userJson === "loading" ? (
        <Loader>Loading user data</Loader>
      ) : (
        <ReactJson src={userJson || {}} />
      )}
    </div>
  );
}
