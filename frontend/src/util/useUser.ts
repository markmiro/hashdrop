import { UserDrop } from "./UserJson";
import _ from "lodash";
import axios from "axios";
import { useCallback, useEffect, useReducer, useState } from "react";
import { format } from "date-fns";
import { useMetaMaskEthereum } from "../eth-react/useMetaMaskEthereum";
import { User as UserT } from "../typechain";
import { useContract } from "../eth-react/useContract";
import { createUserJson, UserJson } from "./UserJson";
import { blobToCid, cidToUrl, pinBlob, textToBlob } from "./dropUtils";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { initialUserJson, reducer } from "../util/userJsonReducer";
import delay from "delay";
import pkg from "../../package.json";

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd-HH_mm_ss");
}

export function useUser() {
  const provider = useEthersProvider();
  const { data } = useMetaMaskEthereum();
  const userContract = useContract<UserT>("User");
  const [userJson, dispatch] = useReducer(reducer, initialUserJson);
  const [loading, setLoading] = useState(false);

  const getUserJson = useCallback(async () => {
    setLoading(true);

    if (!userContract.contract) return new Error("No 'Drops smart contract");
    if (!data.selectedAddress) return new Error("No address selected");

    const userAddress = data.selectedAddress;
    const userCid = await userContract.contract.addressToRootCid(userAddress);
    const userJson = userCid
      ? (await axios.get<UserJson>(cidToUrl(userCid))).data
      : createUserJson(userAddress);
    await delay(200);

    dispatch({ type: "SET", value: userJson });
    setLoading(false);
  }, [userContract.contract, data.selectedAddress]);

  useEffect(() => {
    getUserJson();
  }, [getUserJson]);

  const addDrop = async (partialDrop: {
    dropTitle?: string;
    cid: string;
    privateCid: string;
  }) => {
    if (!userContract.contract) return new Error("No 'Drops smart contract");
    if (!data.selectedAddress) return new Error("No address selected");
    if (!userJson) throw new Error("`userJson` expected to be set");

    const userDrop: UserDrop = {
      modified: undefined,
      created: Date.now(),
      appCommitHash: process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ?? "",
      appVersion: pkg?.version,
      userAddress: data.selectedAddress,
      cid: partialDrop.cid,
      privateCid: partialDrop.privateCid,
      dropTitle: partialDrop.dropTitle || `Example ${formatDate(new Date())}`,
    };
    let newUserJson = _.cloneDeep(userJson);
    newUserJson.drops[partialDrop.cid] = userDrop;
    dispatch({ type: "SET", value: newUserJson });
    await save(newUserJson);
  };

  const save = async (userJson: UserJson) => {
    setLoading(true);
    if (!userContract.contract) return new Error("No 'Drops smart contract");
    if (!data.selectedAddress) return new Error("No address selected");

    const newUserBlob = textToBlob(JSON.stringify(userJson));
    const newUserCid = await blobToCid(newUserBlob);
    const remoteNewUserCid = await pinBlob(newUserBlob);
    if (newUserCid !== remoteNewUserCid) {
      return new Error("User JSON: Local and remote CID don't match.");
    }

    const signer = provider.getSigner();
    const dropsTx = await userContract.contract.connect(signer).set(newUserCid);
    await dropsTx.wait();
    setLoading(false);
  };

  return { loading, userJson, addDrop, save, dispatch };
}
