import { Button, ButtonGroup } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/toast";
import delay from "delay";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";
import { useMetaMaskOverlay } from "../../eth-react/MetaMaskOverlay";
import { Loader } from "../../generic/Loader";
import { Stepper, StepperItem, useStepper } from "../Stepper";

enum Steps {
  Load,
  Decrypt,
  Confirm,
  Publish,
}

export function StepperExample() {
  const metamaskOverlay = useMetaMaskOverlay();
  const provider = useEthersProvider();
  const toast = useToast();

  const stepper = useStepper({
    activeIndex: -1,
    steps: {
      [Steps.Load]: { isDone: false },
      [Steps.Decrypt]: { isDone: false },
      [Steps.Confirm]: { isDone: false },
      [Steps.Publish]: { isDone: false },
    },
  });

  const play = async () => {
    stepper.reset();
    await stepper.takeStep(Steps.Load, () => delay(1000));
    await stepper.takeStep(Steps.Decrypt, async () => {
      await metamaskOverlay.openFor(async () => {
        const signer = provider.getSigner();
        const signed = await signer.signMessage("test");
        toast({ title: "Signed: " + signed, isClosable: true });
      });
    });
    await stepper.takeStep(Steps.Confirm, () => delay(1000));
    await stepper.takeStep(Steps.Publish, () => delay(1000));
    stepper.completeToStep(Steps.Publish);
  };

  const completeToStepConfirm = () => {
    stepper.completeToStep(Steps.Confirm);
  };

  return (
    <>
      <Stepper activeIndex={stepper.activeIndex} steps={stepper.steps}>
        <StepperItem stepIndex={Steps.Load} title="Load">
          <Loader>Loading</Loader>
        </StepperItem>
        <StepperItem stepIndex={Steps.Decrypt} title="Decrypt" onRetry={play}>
          <Loader>Loading</Loader>
        </StepperItem>
        <StepperItem stepIndex={Steps.Confirm} title="Confirm">
          <Loader>Loading</Loader>
        </StepperItem>
        <StepperItem stepIndex={Steps.Publish} title="Publish">
          <Loader>Loading</Loader>
        </StepperItem>
      </Stepper>
      <ButtonGroup>
        <Button onClick={play}>Play</Button>
        <Button onClick={completeToStepConfirm}>
          Complete to Step Confirm
        </Button>
        <Button onClick={stepper.reset}>Reset</Button>
      </ButtonGroup>
    </>
  );
}
