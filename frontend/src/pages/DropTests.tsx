import { CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, HStack, Icon, Input } from "@chakra-ui/react";
import axios from "axios";
import { base64ToBlob } from "base64-blob";
import { format } from "date-fns";
import _ from "lodash";
import { FC, useState } from "react";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { useMetaMaskEthereum } from "../eth-react/useMetaMaskEthereum";
import { Drops as DropsT, HashDrop as HashDropT } from "../typechain";
import { decryptFileString, encryptFob } from "../util/encrypt";
import { fobAsText } from "../util/fobAsText";
import { ipfsCid } from "../util/ipfsCid";
import { cidToUrl, pinFile } from "../util/pinata";
import { textToBlob } from "../util/textToBlob";
const pkg = require("../../package.json");

type UserDrop = {
  appVersion: string;
  appCommitHash: string;
  userAddress: string;
  cid: string;
  privateCid?: string;
  dropTitle?: string;
};

type UserJson = {
  userAddress: string;
  drops: Record<string, UserDrop>;
};

const steps = [
  "START_DROP",
  "FETCH",
  "PROCESS",
  "ENCRYPT",
  "SAVE",
  "NOTARIZE_FILE",
  "NOTARIZE_USER",
  "NOTARIZE_DONE",
  "DONE_1",
  // "VERIFY_SAVE",
  // ---
  "START_PUBLISH",
  "FETCH_SAVED",
  "DECRYPT",
  "PUBLISH",
  "DONE_2",
  // "VERIFY_PUBLISH",
] as const;
type Step = typeof steps[number];
const stepKeys = _.mapValues(_.invert(steps) as Record<Step, string>, (v) =>
  parseInt(v)
);

function createUserJson(userAddress: string): UserJson {
  return {
    userAddress,
    drops: {},
  };
}

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd-HH_mm_ss");
}

const Item: FC<{ isCurrent: boolean; isChecked: boolean }> = ({
  isCurrent,
  isChecked,
  children,
}) => (
  <HStack spacing={2}>
    <Icon
      as={isCurrent ? TimeIcon : CheckCircleIcon}
      color={isChecked ? "black" : "blackAlpha.300"}
    />{" "}
    <Box>{children}</Box>
  </HStack>
);

export function DropTests() {
  const { data } = useMetaMaskEthereum();
  const provider = useEthersProvider();
  const drops = useContract<DropsT>("Drops");
  const hashdrop = useContract<HashDropT>("HashDrop");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const textMessage = `Hello message: ${formatDate(new Date())}`;

  const addPrivate = async (userAddress: string, textMessage: string) => {
    setCurrentStepIndex(stepKeys.START_DROP);

    // Check that we're good to go
    if (!drops.contract) return new Error("No 'Drops smart contract");
    if (!hashdrop.contract) return new Error("No 'HashDrop smart contract");

    setCurrentStepIndex(stepKeys.FETCH);

    // Get existing blockchain information
    const userCid = await drops.contract.addressToRootCid(userAddress);
    const userJson = userCid
      ? (await axios.get<UserJson>(cidToUrl(userCid))).data
      : createUserJson(userAddress);

    setCurrentStepIndex(stepKeys.PROCESS);

    // Create file
    const fob = textToBlob(textMessage);
    const cid = await ipfsCid(fob);

    setCurrentStepIndex(stepKeys.ENCRYPT);

    // Encrypt
    const signer = provider.getSigner();
    const password = await signer.signMessage(cid);
    const privateFob = await encryptFob(fob, password);
    const privateCid = await ipfsCid(privateFob);

    setCurrentStepIndex(stepKeys.SAVE);

    // Save drop to IPFS
    const remoteCid = await pinFile(privateFob);
    if (privateCid !== remoteCid) {
      return new Error("File drop: Local and remote CID don't match.");
    }

    // Save user state to IPFS
    const userDrop: UserDrop = {
      appCommitHash: process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ?? "",
      appVersion: pkg?.version,
      userAddress,
      cid,
      privateCid,
      dropTitle: `Example ${formatDate(new Date())}`,
    };
    let newUserJson = userJson;
    newUserJson.drops[cid] = userDrop;
    const newUserBlob = textToBlob(JSON.stringify(newUserJson));
    const newUserCid = await ipfsCid(newUserBlob);
    const remoteNewUserCid = await pinFile(newUserBlob);
    if (newUserCid !== remoteNewUserCid) {
      return new Error("User JSON: Local and remote CID don't match.");
    }

    // Notarize to the blockchain
    setCurrentStepIndex(stepKeys.NOTARIZE_FILE);
    const hashdropTx = await hashdrop.contract
      .connect(signer)
      .addPrivate(cid, privateCid);
    setCurrentStepIndex(stepKeys.NOTARIZE_USER);
    const dropsTx = await drops.contract.connect(signer).set(newUserCid);
    await hashdropTx.wait();
    await dropsTx.wait();

    setCurrentStepIndex(stepKeys.NOTARIZE_DONE);

    // At this point...
    // ---
    // The encrypted file is on IPFS
    // Private and public CID of the file are on Ethereum
    // The user json is on IPFS
    // A new user CID is calculated from user json and on Ethereum

    // Verify
    // Pull everything down and see that it's what we put up

    return cid;
  };

  const publishPrivate = async (userAddress: string, cid: string) => {
    setCurrentStepIndex(stepKeys.START_PUBLISH);

    // Check that we're good to go
    if (!drops.contract) return new Error("No 'Drops smart contract");
    if (!hashdrop.contract) return new Error("No 'HashDrop smart contract");

    // Get existing blockchain information
    const userCid = await drops.contract.addressToRootCid(userAddress);
    const userJson = userCid
      ? (await axios.get<UserJson>(cidToUrl(userCid))).data
      : createUserJson(userAddress);
    if (!userJson.drops[cid]) {
      debugger;
      return new Error(
        `Can't find expected drop with CID ${cid} in JSON file with CID ${userCid} for user ${userAddress}`
      );
    }
    const privateCid = userJson.drops[cid].privateCid;
    if (!privateCid) return new Error("File was never encrypted.");

    // Fetch
    const res = await fetch(cidToUrl(privateCid));
    if (res.status === 404) {
      return new Error(`Encrypted file with CID ${privateCid} not found.`);
    }
    const encrypted = await res.text();

    setCurrentStepIndex(stepKeys.FETCH_SAVED);

    // Decrypt
    const signer = provider.getSigner();
    const ps = await signer.signMessage(cid);
    const dataUrl = await decryptFileString(encrypted, ps);
    const fob = await base64ToBlob(dataUrl);
    const textMessage = await fobAsText(fob);

    setCurrentStepIndex(stepKeys.DECRYPT);

    // Publish to IPFS
    const remoteCid = await pinFile(fob);
    if (cid !== remoteCid) {
      return new Error("Local and remote CID don't match.");
    }

    setCurrentStepIndex(stepKeys.PUBLISH);

    return textMessage;
  };

  const dropIt = async () => {
    // Check that we're good to go
    if (!data.selectedAddress) return new Error("No address selected");
    const userAddress = data.selectedAddress;

    // Add private
    const cidOrErr = await addPrivate(userAddress, textMessage);
    if (_.isError(cidOrErr)) return cidOrErr;
    const cid = cidOrErr;
    setCurrentStepIndex(stepKeys.DONE_1);

    // Decrypt and publish
    const textMessageDecryptedOrErr = await publishPrivate(userAddress, cid);
    if (_.isError(textMessageDecryptedOrErr)) return textMessageDecryptedOrErr;
    if (textMessage !== textMessageDecryptedOrErr) {
      debugger;
      return new Error("Text and decrypted text don't match.");
    }
    setCurrentStepIndex(stepKeys.DONE_2 + 1);
  };

  return (
    <>
      <Input readOnly value={textMessage} />
      <div>
        GIT COMMIT SHA: {process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ?? "N/A"}
      </div>
      <div>Version: {pkg?.version}</div>
      <div>Block number: {parseInt(data?.blockNumber ?? "", 16)}</div>
      <Button
        onClick={() =>
          dropIt().then((res) => _.isError(res) && alert(res.message))
        }
      >
        Drop It
      </Button>

      <Divider />
      {steps.map((step, i) => (
        <Item
          key={i}
          isChecked={currentStepIndex >= i}
          isCurrent={currentStepIndex === i}
        >
          {step}
        </Item>
      ))}
    </>
  );
}
