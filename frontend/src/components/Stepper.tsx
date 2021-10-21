import { Button } from "@chakra-ui/button";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, HStack, VStack } from "@chakra-ui/layout";
import { Collapse } from "@chakra-ui/transition";
import styled from "@emotion/styled";
import _ from "lodash";
import React, { createContext, FC, useContext, useRef, useState } from "react";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";

export type StepStatus = "INITIAL" | "ACTIVE" | "DONE";
export type StepSetting = {
  isDone: boolean;
  error?: Error;
};
export type StepSettings = Record<number, StepSetting>;
export type StepperContextValue = {
  activeIndex: number;
  steps: StepSettings;
};

const StepperContext = createContext<StepperContextValue>({
  activeIndex: -1,
  steps: {},
});

export function useStepper(
  initial: StepperContextValue = { activeIndex: -1, steps: {} }
) {
  const [activeIndex, setActiveIndex] = useState(initial.activeIndex);
  const [steps, setSteps] = useState<StepSettings>(initial.steps);

  const setStep = (index: number, stepSetting: StepSetting) => {
    setSteps((steps) => {
      const newSteps = _.cloneDeep(steps);
      newSteps[index] = {
        ...steps[index],
        ...stepSetting,
      };
      return newSteps;
    });
  };

  const takeStep = async (stepIndex: number, func: () => Promise<void>) => {
    try {
      setActiveIndex(stepIndex);
      await func();
      setStep(stepIndex, { isDone: true, error: undefined });
    } catch (err) {
      setStep(stepIndex, { isDone: false, error: err as Error });
      throw err;
    }
  };

  const completeToStep = (stepIndex: number) => {
    const newSteps: StepSettings = {};
    for (let i = 0; i <= stepIndex; i++) {
      newSteps[i] = { isDone: true };
    }
    setActiveIndex(-1);
    setSteps(newSteps);
  };

  const reset = () => {
    setActiveIndex(-1);
    setSteps({});
  };

  return {
    steps,
    activeIndex,
    completeToStep,
    takeStep,
    reset,
  };
}

const StepCircle = styled(Box)`
  counter-increment: list-number;
  // background: #00000011;
  width: 1.5em;
  height: 1.5em;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Need ":before" to render content
const StepNumber = styled.div`
  &:before {
    content: counter(list-number);
  }
`;

const StepperIcon = ({
  isDone,
  isActive,
  isError,
}: {
  isDone: boolean;
  isActive: boolean;
  isError: boolean;
}) => {
  if (isError) {
    return (
      <StepCircle bg="red.100" color="red.500" fontWeight="bold">
        !
      </StepCircle>
    );
  }
  if (isActive) {
    return (
      <StepCircle bg="black" color="white" fontWeight="medium">
        <StepNumber />
      </StepCircle>
    );
  }
  if (!isDone) {
    return (
      <StepCircle bg="gray.100" fontWeight="medium">
        <StepNumber />
      </StepCircle>
    );
  }
  if (isDone) {
    return (
      <StepCircle bg="green.100" color="green.700">
        <CheckIcon boxSize={3.5} />
      </StepCircle>
    );
  }
  throw Error("Invalid state in component.");
};

export const StepperItem: FC<{
  stepIndex: number;
  title: string;
  onRetry?: () => void;
}> = ({ onRetry, stepIndex, title, children }) => {
  const { steps, activeIndex } = useContext(StepperContext);
  const error = steps[stepIndex]?.error;
  const isActive = stepIndex === activeIndex;
  return (
    <Box as="li" display="block">
      <HStack spacing={2}>
        <StepperIcon
          isError={!!error}
          isDone={steps[stepIndex]?.isDone}
          isActive={stepIndex === activeIndex}
        />

        <Box fontWeight="medium">{title}</Box>
      </HStack>
      <Collapse in={isActive && !!error}>
        <ErrorMessage>{error?.message}</ErrorMessage>
        <Button variant="outline" size="xs" colorScheme="red" onClick={onRetry}>
          Try Again
        </Button>
      </Collapse>
      <Collapse in={isActive && !error}>
        {_.isFunction(children) ? isActive && children() : children}
      </Collapse>
    </Box>
  );
};

export const StepperWrapper: FC = ({ children }) => {
  return (
    <VStack
      as="ol"
      align="start"
      spacing={2}
      style={{ counterReset: "list-number" }}
    >
      {children}
    </VStack>
  );
};

export const Stepper: FC<{ steps: StepSettings; activeIndex: number }> = ({
  steps,
  activeIndex,
  children,
}) => {
  return (
    <StepperContext.Provider value={{ steps, activeIndex }}>
      <StepperWrapper>
        {React.Children.map(children as any, (child, i) =>
          React.cloneElement(child, { stepIndex: i })
        )}
      </StepperWrapper>
    </StepperContext.Provider>
  );
};
