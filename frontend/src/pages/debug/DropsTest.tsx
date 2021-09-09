import axios from "axios";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { createUserJson, UserJson } from "../../components/UserJson";
import { useContract } from "../../eth-react/useContract";
import { useMetaMaskEthereum } from "../../eth-react/useMetaMaskEthereum";
import { Drops as DropsT } from "../../typechain";
import { cidToUrl } from "../../util/pinata";

export function DropsTest() {
  const { data } = useMetaMaskEthereum();
  const drops = useContract<DropsT>("Drops");
  const [userJson, setUserJson] = useState<UserJson | null>(null);

  useEffect(() => {
    const doAsync = async () => {
      debugger;
      if (!drops.contract) return new Error("No 'Drops smart contract");
      if (!data.selectedAddress) return new Error("No address selected");

      const userAddress = data.selectedAddress;
      const userCid = await drops.contract.addressToRootCid(userAddress);
      const userJson = userCid
        ? (await axios.get<UserJson>(cidToUrl(userCid))).data
        : createUserJson(userAddress);
      setUserJson(userJson);
    };
    doAsync();
  }, [drops.contract, data.selectedAddress]);

  return (
    <div>
      <ReactJson
        src={userJson || {}}
        displayDataTypes={false}
        quotesOnKeys={false}
        displayObjectSize={false}
        enableClipboard={false}
      />
    </div>
  );
}
