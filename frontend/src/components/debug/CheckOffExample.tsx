import { Button, ButtonGroup } from "@chakra-ui/button";
import delay from "delay";
import { useState } from "react";
import { CheckOffItem, CheckOffStatus, CheckOffWrapper } from "../CheckOff";

const initialStatuses: Record<string, CheckOffStatus> = {
  load: "",
  decrypt: "",
  confirm: "",
  publish: "",
};

export function CheckOffExample() {
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
    await delay(500);
    setStatuses({
      ...statuses,
      load: "DONE",
      decrypt: "DONE",
      confirm: "ERROR",
    });
  };

  return (
    <CheckOffWrapper>
      <CheckOffItem title="Load" status={statuses["load"]} />
      <CheckOffItem title="Decrypt" status={statuses["decrypt"]} />
      <CheckOffItem title="Confirm" status={statuses["confirm"]} />
      <CheckOffItem title="Publish" status={statuses["publish"]} />
      <ButtonGroup>
        <Button onClick={play}>Play</Button>
        <Button onClick={reset}>Reset</Button>
      </ButtonGroup>
    </CheckOffWrapper>
  );
}
