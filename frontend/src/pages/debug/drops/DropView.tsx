import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { UserJson } from "../../../util/UserJson";
import { cidToUrl } from "../../../util/pinata";
import { IFramePreview } from "../../../components/IFramePreview";
import { Cid } from "../../../eth-react/Cid";
import {
  DecrypterState,
  useDecrypter,
} from "../../../components/ShowDrop/useDecrypter";
import { Loader } from "../../../generic/Loader";
import { StepperItem } from "../../../components/Stepper";

function State({ state }: { state: DecrypterState }) {
  return (
    <Box bg="blackAlpha.100" display="flex">
      STATE: {state || "N/A"}
      {state === "DECRYPTING" ||
        state === "LOADING" ||
        state === "PUBLISHING" ||
        (state === "CHECKING_AVAILABLE" && <Loader />)}
    </Box>
  );
}

const EmptyView = () => (
  <Center
    w="100%"
    h="40vh"
    fontSize="xl"
    fontWeight="medium"
    bg="blackAlpha.100"
  >
    👈 Choose an item.
  </Center>
);

export function DropView({
  cid,
  userJson,
}: {
  cid?: string | null;
  userJson?: UserJson;
}) {
  const decrypter = useDecrypter();

  if (!cid) return <EmptyView />;

  const userDrop = userJson?.drops[cid];
  const privateCid = userDrop?.privateCid;

  if (privateCid) {
    return (
      <VStack spacing={2} alignItems="stretch">
        <Heading>{userDrop?.dropTitle}</Heading>
        <label>CID:</label>
        <Cid cid={cid} />
        <iframe
          style={{ border: "1px solid" }}
          title="cid"
          src={cidToUrl(cid)}
          width="100%"
          height="300px"
        />
        <label>Private CID:</label>
        <Cid cid={privateCid} />
        <ButtonGroup>
          <Button onClick={() => decrypter.decrypt(cid, privateCid)}>
            Decrypt
          </Button>
          <Button onClick={() => alert("notarize")}>Notarize</Button>
        </ButtonGroup>
        {decrypter.dataUrl && (
          <>
            <Box borderWidth={1} w="full">
              <IFramePreview src={decrypter.dataUrl} />
            </Box>
            <Button
              colorScheme="green"
              onClick={() => decrypter.publish().then(() => alert("done!"))}
            >
              Publish
            </Button>
          </>
        )}
        <VStack align="start" spacing={2}>
          <StepperItem title="Load" status="DONE" />
          <StepperItem title="Decrypt" status="ERROR" />
          <StepperItem title="Confirm" status="IN_PROGRESS" />
          <StepperItem title="Publish" status="" />
          <StepperItem title="Verify" status="" />
        </VStack>
        <State state={decrypter.state} />
      </VStack>
    );
  }

  return <IFramePreview src={cidToUrl(cid)} />;
}
