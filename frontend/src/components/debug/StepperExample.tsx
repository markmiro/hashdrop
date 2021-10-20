import { Button, ButtonGroup } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import delay from "delay";
import { useState } from "react";
import { MetaMaskOverlay } from "../../eth-react/MetaMaskOverlay";
import { StepperItem, StepperStatus, StepperWrapper } from "../Stepper";

const initialStatuses: Record<string, StepperStatus> = {
  load: "",
  decrypt: "",
  confirm: "",
  publish: "",
};

export function StepperExample() {
  const metaMaskDisclosure = useDisclosure();
  const [statuses, setStatuses] = useState(initialStatuses);

  const reset = () => {
    setStatuses(initialStatuses);
  };

  const play = async () => {
    setStatuses({ ...statuses, load: "IN_PROGRESS" });
    await delay(500);
    setStatuses({ ...statuses, load: "DONE" });
    await delay(500);
    setStatuses({ ...statuses, load: "DONE", decrypt: "IN_PROGRESS" });
    await delay(500);
    setStatuses({ ...statuses, load: "DONE", decrypt: "DONE" });
    await delay(500);
    setStatuses({
      ...statuses,
      load: "DONE",
      decrypt: "DONE",
      confirm: "IN_PROGRESS",
    });
    metaMaskDisclosure.onOpen();
    await delay(2000);
    setStatuses({
      ...statuses,
      load: "DONE",
      decrypt: "DONE",
      confirm: "ERROR",
    });
    metaMaskDisclosure.onClose();
  };

  return (
    <StepperWrapper>
      <StepperItem title="Load" status={statuses["load"]} />
      <StepperItem title="Decrypt" status={statuses["decrypt"]} />
      <StepperItem title="Confirm" status={statuses["confirm"]} />
      <StepperItem title="Publish" status={statuses["publish"]} />
      <ButtonGroup>
        <Button onClick={play}>Play</Button>
        <Button onClick={reset}>Reset</Button>
      </ButtonGroup>
      <MetaMaskOverlay
        isOpen={metaMaskDisclosure.isOpen}
        onClose={metaMaskDisclosure.onClose}
      >
        <Button size="xs" onClick={metaMaskDisclosure.onClose}>
          Cancel
        </Button>
      </MetaMaskOverlay>
    </StepperWrapper>
  );
}