import queryString from "query-string";
import { FC, useCallback, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { DataTabs } from "../components/DataTabs/DataTabs";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { Cid } from "../eth-react/Cid";
import { Cover } from "../generic/Cover";
import { Loader } from "../generic/Loader";
import { HashDrop as T } from "../typechain";
import { encryptFob } from "../util/encrypt";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile, unpin } from "../util/pinata";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { Anchor } from "../generic/Anchor";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { IoLogoTwitter } from "react-icons/io5";

// const DROP_ORIGIN = `https://ipfs.io/ipfs/${HASHDROP_DEPLOY_CID}`;
const DROP_ORIGIN = window.location.origin;
// const DROP_ORIGIN = "https://www.hashdrop.me";

const dropUrl = (dropId: string) => `${DROP_ORIGIN}/#/drop/${dropId}`;

const tweetUrl = (dropId: string) =>
  `https://twitter.com/intent/tweet?${queryString.stringify({
    text: "I made a prediction",
    url: dropUrl(dropId),
  })}`;

function useAdd() {
  const handleError = useErrorHandler();
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const add = useCallback(
    async (cid: string) => {
      try {
        setSuccess(false);
        setLoading(true);
        if (!hashdrop.contract) throw new Error("Contract isn't set yet");

        const signer = provider.getSigner();
        const tx = await hashdrop.contract.connect(signer).add(cid);
        await tx.wait();
        setSuccess(true);

        setLoading(false);
      } catch (err) {
        setLoading(false);
        handleError(err);
      }
    },
    [provider, hashdrop, handleError]
  );

  const addPrivate = useCallback(
    async (cid: string, privateCid: string) => {
      try {
        setSuccess(false);
        setLoading(true);
        if (!hashdrop.contract) throw new Error("Contract isn't set yet");

        const signer = provider.getSigner();
        const tx = await hashdrop.contract
          .connect(signer)
          .addPrivate(cid, privateCid);
        await tx.wait();

        setSuccess(true);

        setLoading(false);
      } catch (err) {
        setLoading(false);
        handleError(err);
      }
    },
    [provider, hashdrop, handleError]
  );

  return { add, addPrivate, loading, success };
}

type DropStatus =
  | "INITIAL"
  | "PROCESSING"
  | "ENCRYPTING"
  | "SENDING_IPFS"
  | "SENDING_ETH"
  | "SUCCESS"
  | "ERROR";

const StatusText: FC<{
  status: DropStatus;
  error: string;
  onReset: () => void;
}> = ({ status, error, onReset, children }) => {
  switch (status) {
    case "INITIAL":
      return <>{children}</>;
    case "PROCESSING":
      return <Loader>Processing</Loader>;
    case "ENCRYPTING":
      return <Loader>Encrypting</Loader>;
    case "SENDING_IPFS":
      return <Loader>Sending to IPFS</Loader>;
    case "SENDING_ETH":
      return <Loader>Saving to Ethereum blockchain</Loader>;
    case "SUCCESS":
      return <></>;
    case "ERROR":
      return (
        <Alert
          status="error"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <VStack spacing={2}>
            <Flex>
              <AlertIcon />
              <AlertTitle>Error</AlertTitle>
            </Flex>
            {error && <AlertDescription>{error}</AlertDescription>}
            <Button isFullWidth colorScheme="red" onClick={onReset}>
              OK
            </Button>
          </VStack>
        </Alert>
      );
    default:
      return <>{children}</>;
  }
};

function useHashDrop() {
  const provider = useEthersProvider();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cid, setCid] = useState("");
  const [privateCid, setPrivateCid] = useState("");
  const [status, setStatus] = useState<DropStatus>("INITIAL");
  const [error, setError] = useState("");
  const ethAdd = useAdd();

  const updateStatus = async (status: DropStatus) => {
    setStatus(status);
    // await delay(1000);
  };

  const reset = () => {
    setIsProcessing(false);
    setCid("");
    setPrivateCid("");
    setError("");
    setStatus("INITIAL");
  };

  const add = useCallback(
    async (fob: File | Blob | null) => {
      try {
        setIsProcessing(true);
        await updateStatus("PROCESSING");

        if (!fob) throw new Error("Please pick a file.");
        const cid = await ipfsCid(fob);
        setCid(cid);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.add(cid);
        await updateStatus("SENDING_IPFS");
        const remoteCid = await pinFile(fob);
        if (cid !== remoteCid) throw new Error("Internal error.");
        await updateStatus("SUCCESS");
        setIsProcessing(false);
      } catch (err) {
        setStatus("ERROR");
        setError(err.message);
        setIsProcessing(false);
        // throw new Error(err);
      }
    },
    [ethAdd]
  );

  const addPrivate = useCallback(
    async (fob: File | Blob | null) => {
      try {
        setStatus("PROCESSING");
        setIsProcessing(true);
        if (!fob) throw new Error("Please pick a file.");

        // Create password
        await updateStatus("ENCRYPTING");
        const cid = await ipfsCid(fob);
        setCid(cid);
        const signer = provider.getSigner();
        const ps = await signer.signMessage(cid);

        // Encrypt
        const privateFob = await encryptFob(fob, ps);
        const privateCid = await ipfsCid(privateFob);
        setPrivateCid(privateCid);

        // Save / upload
        await updateStatus("SENDING_ETH");
        await ethAdd.addPrivate(cid, privateCid);
        await updateStatus("SENDING_IPFS");
        const remotePrivateCid = await pinFile(privateFob);
        if (privateCid !== remotePrivateCid) throw new Error("Internal error.");
        setStatus("SUCCESS");
        setIsProcessing(false);
      } catch (err) {
        setStatus("ERROR");
        setError(err.message);
        setIsProcessing(false);
        // throw new Error(err);
      }
    },
    [provider, ethAdd]
  );

  const verify = useCallback(async (fob: File | Blob | null, cid) => {
    throw new Error("TODO: implement");
  }, []);

  return {
    add,
    cid,
    privateCid,
    addPrivate,
    verify,
    status,
    isProcessing,
    error,
    reset,
  };
}

export function Drop() {
  const [fob, setFob] = useState<File | Blob | null>(null);
  const hashdrop = useHashDrop();

  return (
    <>
      <DataTabs onFobChange={setFob} />

      <Button
        colorScheme="blue"
        disabled={!fob}
        onClick={() => hashdrop.addPrivate(fob)}
      >
        Add Private
      </Button>

      <Modal
        isOpen={hashdrop.status !== "INITIAL"}
        onClose={() => {}}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <Box textAlign="center">
            <StatusText
              status={hashdrop.status}
              error={hashdrop.error}
              onReset={hashdrop.reset}
            />
          </Box>
          {hashdrop.status === "SUCCESS" && hashdrop.cid && (
            <>
              <ModalHeader>File was published.</ModalHeader>
              <ModalBody>
                <Alert status="success">
                  <AlertIcon />
                  Data was successfully notarized on the blockchain and pinned
                  on IPFS.
                </Alert>
                <Cid cid={hashdrop.cid} />
              </ModalBody>
            </>
          )}

          {hashdrop.status === "SUCCESS" && hashdrop.cid && (
            <ModalFooter>
              <VStack spacing="2" w="100%">
                {/* https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent */}
                <Button
                  colorScheme="twitter"
                  isFullWidth
                  as="a"
                  href={tweetUrl(hashdrop.cid)}
                  target="_blank"
                  rel="noreferrer"
                  rightIcon={<IoLogoTwitter />}
                >
                  Tweet
                </Button>
                <Button
                  isFullWidth
                  as="a"
                  href={dropUrl(hashdrop.cid)}
                  target="_blank"
                  rel="noreferrer"
                  rightIcon={<ArrowForwardIcon />}
                >
                  See Drop
                </Button>
                {/* {process.env.NODE_ENV === "development" && (
                  <Button
                    colorScheme="red"
                    onClick={() =>
                      unpin(hashdrop.privateCid).then(() => {
                        alert("Unpin success!");
                        setFob(null);
                        hashdrop.reset();
                      })
                    }
                  >
                    Unpin
                  </Button>
                )} */}
              </VStack>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
      <p>
        <Anchor
          textDecor="underline"
          to="https://www.kalzumeus.com/essays/dropping-hashes"
          isExternal
        >
          Dropping hashes: an idiom used to demonstrate provenance of documents
        </Anchor>
      </p>
    </>
  );
}
