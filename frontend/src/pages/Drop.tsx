import { ArrowForwardIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import queryString from "query-string";
import { FC, useCallback, useState } from "react";
import { IoLogoTwitter } from "react-icons/io5";
import { DataTabs } from "../components/DataTabs/DataTabs";
import { CurrentChainName } from "../eth-react/CurrentChainName";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { CopyButton } from "../generic/CopyButton";
import { Loader } from "../generic/Loader";
import { HashDrop as T } from "../typechain";
import { encryptFob } from "../util/encrypt";
import { ipfsCid } from "../util/ipfsCid";
import { pinFile } from "../util/pinata";

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
        throw err;
      }
    },
    [provider, hashdrop]
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
        throw err;
      }
    },
    [provider, hashdrop]
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

const Status: FC = ({ children }) => (
  <Box px={4} py={2}>
    <Loader>{children}</Loader>
  </Box>
);

const StatusText: FC<{
  status: DropStatus;
  error: string;
  onReset: () => void;
}> = ({ status, error, onReset, children }) => {
  switch (status) {
    case "INITIAL":
      return <>{children}</>;
    case "PROCESSING":
      return <Status>Processing</Status>;
    case "ENCRYPTING":
      return <Status>Encrypting</Status>;
    case "SENDING_IPFS":
      return <Status>Sending to IPFS</Status>;
    case "SENDING_ETH":
      return (
        <Status>
          Saving to <CurrentChainName /> blockchain
        </Status>
      );
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
        if (privateCid !== remotePrivateCid)
          throw new Error(
            "Internal error. Different signature for local and uploaded file."
          );
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
      <Box fontSize="xl">
        <Link
          // as={Link}
          fontSize="2xl"
          display="block"
          // bg="blackAlpha.50"
          // _hover={{ bg: "blackAlpha.100" }}
          _hover={{ textDecoration: "underline" }}
          fontWeight="normal"
          // px={4}
          // py={2}
          // rounded="lg"
          href="https://www.kalzumeus.com/essays/dropping-hashes"
          isExternal
        >
          <HStack spacing={2}>
            <Text lineHeight="short">
              Dropping hashes: an idiom used to demonstrate provenance of
              documents
            </Text>
            <Text fontSize="xs">A dapp inspired by Patrick McKenzie.</Text>
            <Icon boxSize="1.5em" opacity="0.5" as={ChevronRightIcon} />
          </HStack>
        </Link>
      </Box>

      <Box
        borderWidth={1}
        borderColor="blackAlpha.300"
        p={4}
        rounded="2xl"
        shadow="md"
      >
        <VStack spacing={4} align="stretch">
          <DataTabs onFobChange={setFob} />
          <Divider />
          <VStack spacing={2} alignItems="center">
            <Button
              size="lg"
              colorScheme="blue"
              disabled={!fob}
              onClick={() => hashdrop.addPrivate(fob)}
              isFullWidth
            >
              Add Drop
            </Button>
            {/* <Text
              color="blackAlpha.500"
              fontSize="xs"
              textAlign="center"
              margin="auto"
              w="md"
              lineHeight="short"
            >
              Your data will be encrypted before it leaves this page. Your
              crypto wallet will prompt you to confirm before data is encrypted
              and stored on IPFS.
            </Text> */}
          </VStack>
        </VStack>
      </Box>

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
              <ModalHeader color="green.500" borderBottomWidth={1}>
                ✓ Private file was saved.
              </ModalHeader>
              <ModalBody>
                Data was successfully notarized on the blockchain and pinned to
                IPFS.
              </ModalBody>
            </>
          )}

          {hashdrop.status === "SUCCESS" && hashdrop.cid && (
            <ModalFooter>
              <VStack spacing="2" w="100%">
                <InputGroup size="lg">
                  <Input value={dropUrl(hashdrop.cid)} isReadOnly />
                  <InputRightAddon>
                    <CopyButton toCopy={dropUrl(hashdrop.cid)} as={Button} />
                  </InputRightAddon>
                </InputGroup>
                {/* https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent */}
                <Button
                  size="lg"
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
                  size="lg"
                  isFullWidth
                  as="a"
                  href={dropUrl(hashdrop.cid)}
                  target="_blank"
                  rel="noreferrer"
                  rightIcon={<ArrowForwardIcon />}
                >
                  View / publish your file
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
    </>
  );
}
