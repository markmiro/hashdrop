import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import { FC } from "react";
import { ErrorMessage } from "../../generic/Errors/ErrorMessage";
import { Loader } from "../../generic/Loader";
import { IFramePreview } from "../IFramePreview";
import { useCheckIpfsCidExists } from "./useCheckIpfsCidExists";
import { DecrypterState, useDecrypter } from "./useDecrypter";

const StateText: FC<{ state: DecrypterState }> = ({ state }) => {
  switch (state) {
    case "INITIAL":
      return <div>None</div>;
    case "LOADING":
      return <Loader>Loading file</Loader>;
    case "DECRYPTING":
      return <Loader>Decrypting</Loader>;
    case "DECRYPTED":
      return <div>Decrypted</div>;
    case "PUBLISHING":
      return <Loader>Publishing</Loader>;
    case "PUBLISHED":
      return <div>Published</div>;
    default:
      throw new Error("Not allowed.");
  }
};

function IFramePreview2({
  cid,
  privateCid,
}: {
  cid: string;
  privateCid: string;
}) {
  const decrypter = useDecrypter();

  return (
    <VStack align="stretch" spacing={2}>
      <Button
        size="lg"
        colorScheme="blue"
        onClick={() => decrypter.decrypt(cid, privateCid)}
      >
        Show Your Encrypted File
      </Button>
      {decrypter.dataUrl && (
        <>
          <Box borderWidth={1} w="full">
            <IFramePreview src={decrypter.dataUrl} />
          </Box>
          <Button colorScheme="green" onClick={decrypter.publish}>
            Publish
          </Button>
        </>
      )}
      <HStack p={2} spacing={2} bg="blackAlpha.100">
        Status: <StateText state={decrypter.state} />
      </HStack>
    </VStack>
  );
}

export function ShowMyPrivateDrop({
  cid,
  privateCid,
}: {
  cid: string;
  privateCid: string;
}) {
  const cidChecker = useCheckIpfsCidExists(privateCid);

  return (
    <div>
      {cidChecker.state === "LOADING" && (
        <Loader>Checking IPFS for encrypted file</Loader>
      )}
      {cidChecker.state === "NOT_FOUND" && (
        <ErrorMessage>
          Couldn't find the document.{" "}
          <Button
            variant="link"
            colorScheme="blue"
            onClick={cidChecker.checkAgain}
          >
            Try Again
          </Button>
        </ErrorMessage>
      )}
      {cidChecker.state === "FOUND" && (
        <IFramePreview2 cid={cid} privateCid={privateCid} />
      )}
    </div>
  );
}
