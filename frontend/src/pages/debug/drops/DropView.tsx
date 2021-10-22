import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { IFramePreview } from "../../../components/IFramePreview";
import {
  DecryptSteps,
  useDecrypter,
} from "../../../components/ShowDrop/useDecrypter";
import { Stepper, StepperItem } from "../../../components/Stepper";
import { Cid } from "../../../eth-react/Cid";
import { Loader } from "../../../generic/Loader";
import { cidToUrl } from "../../../util/pinata";
import { UserJson } from "../../../util/UserJson";

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
  const { stepper } = decrypter;

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
          height="100px"
        />
        <label>Private CID:</label>
        <Cid cid={privateCid} />
        {stepper.activeIndex === -1 && (
          <ButtonGroup>
            <Button onClick={() => decrypter.decrypt(cid, privateCid)}>
              Decrypt
            </Button>
          </ButtonGroup>
        )}
        <Stepper activeIndex={stepper.activeIndex} steps={stepper.steps}>
          <StepperItem stepIndex={DecryptSteps.Load} title="Load">
            <Loader>Loading</Loader>
          </StepperItem>
          <StepperItem
            stepIndex={DecryptSteps.Decrypt}
            title="Decrypt"
            onRetry={() => decrypter.decrypt(cid, privateCid)}
          >
            {stepper.steps[DecryptSteps.Decrypt].isDone ? (
              decrypter.dataUrl && (
                <VStack spacing={2} mt={2}>
                  <Box borderWidth={1} w="full">
                    <IFramePreview src={decrypter.dataUrl} />
                  </Box>
                  <Button
                    isFullWidth
                    colorScheme="green"
                    onClick={decrypter.publish}
                  >
                    Publish
                  </Button>
                </VStack>
              )
            ) : (
              <Loader>Loading</Loader>
            )}
          </StepperItem>
          <StepperItem stepIndex={DecryptSteps.Publish} title="Publish">
            <Loader>Loading</Loader>
          </StepperItem>
          <StepperItem
            stepIndex={DecryptSteps.CheckAvailable}
            title="Check Availability"
          >
            <Loader>Attempt {decrypter.availableAttemptCount + 1}</Loader>
            <Box fontSize="xs" opacity={0.5}>
              Note: This may take several attempts.
            </Box>
          </StepperItem>
        </Stepper>
      </VStack>
    );
  }

  return <IFramePreview src={cidToUrl(cid)} />;
}
