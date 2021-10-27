import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Stepper, StepperItem, useStepper } from "../../components/Stepper";
import { Cid } from "../../eth-react/Cid";
import { useMetaMaskOverlay } from "../../eth-react/MetaMaskOverlay";
import { useContract } from "../../eth-react/useContract";
import { Json } from "../../generic/Json";
import { Loader } from "../../generic/Loader";
import {
  blobToCid,
  pinBlob,
  textToBlob,
  useEncrypter,
} from "../../util/dropUtils";
import { HashDrop as HashDropT } from "../../typechain";
import { useUser } from "../../util/useUser";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";

enum DropSteps {
  Encrypt,
  PinEncrypted,
  // PinUserData,
  NotarizeUser,
}

export function DropTest2() {
  const stepper = useStepper({
    activeIndex: -1,
    steps: {
      [DropSteps.Encrypt]: { isDone: false },
      [DropSteps.PinEncrypted]: { isDone: false },
      [DropSteps.NotarizeUser]: { isDone: false },
    },
  });
  const metamaskOverlay = useMetaMaskOverlay();
  const [message, setMessage] = useState(`Test message: ${new Date()}`);
  const [cid, setCid] = useState("");
  const [encCid, setEncCid] = useState("");
  const encrypter = useEncrypter();
  const provider = useEthersProvider();
  const hashdropContract = useContract<HashDropT>("HashDrop");
  const user = useUser();

  const reset = () => {
    setCid("");
    setEncCid("");
  };

  const pinEncryptedText = async () => {
    stepper.reset();
    reset();
    const blob = textToBlob(message);
    const cid = await blobToCid(blob);
    setCid(cid);

    let encrypted: string;
    await stepper.takeStep(DropSteps.Encrypt, async () => {
      await metamaskOverlay.openFor(async () => {
        encrypted = await encrypter.encrypt(blob);
      });
    });
    let privateCid: string;
    await stepper.takeStep(DropSteps.PinEncrypted, async () => {
      privateCid = await pinBlob(textToBlob(encrypted));
      setEncCid(privateCid);
    });
    stepper
      .takeStep(DropSteps.NotarizeUser, async () => {
        await metamaskOverlay.openFor(async () => {
          const signer = provider.getSigner();
          await hashdropContract.contract
            ?.connect(signer)
            .addPrivate(cid, privateCid);
          await user.addDrop({
            cid,
            privateCid,
          });
        });
      })
      .then(() => {
        stepper.completeToStep(DropSteps.NotarizeUser);
      });
  };

  return (
    <VStack spacing={2} align="start">
      <Input value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={pinEncryptedText}>Pin encrypted on Pinata</Button>
      <Stepper activeIndex={stepper.activeIndex} steps={stepper.steps}>
        <StepperItem stepIndex={DropSteps.Encrypt} title="Encrypt">
          <Loader>Encrypting</Loader>
          {/* TODO: show MetaMask */}
        </StepperItem>
        <StepperItem
          stepIndex={DropSteps.PinEncrypted}
          title="Upload encrypted"
        >
          <Loader>Uploading</Loader>
        </StepperItem>
        <StepperItem stepIndex={DropSteps.NotarizeUser} title="Notarize user">
          <Loader>Saving</Loader>
          {/* TODO: show MetaMask */}
          <div>
            Your drops are backed by Ethereum and associated with your account
          </div>
        </StepperItem>
      </Stepper>
      <div>
        ENC CID: <Cid cid={encCid} />
      </div>
      <div>
        PUB CID: <Cid cid={cid} />
      </div>
      {cid && encCid && (
        <Button colorScheme="blue" as={RouterLink} to={`/debug/drops/${cid}`}>
          Drop It
        </Button>
      )}
      <Json src={{ userJson: user?.userJson }} />
    </VStack>
  );
}
