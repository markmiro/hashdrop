import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { HStack, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { FC } from "react";

export type StepperStatus = "" | "DONE" | "IN_PROGRESS" | "ERROR";

export const StepperItem: FC<{
  status: StepperStatus;
  title: string;
}> = ({ status, title, children }) => {
  return (
    <VStack as="ul" spacing={2}>
      <HStack as="li" spacing={1}>
        {status === "IN_PROGRESS" && <Spinner size="sm" />}
        {status === "" && <CheckCircleIcon flexShrink={0} opacity={0.2} />}
        {status === "DONE" && (
          <CheckCircleIcon flexShrink={0} color="green.500" />
        )}
        {status === "ERROR" && <WarningIcon flexShrink={0} color="red.500" />}
        <span>{title}</span>
      </HStack>
      {children}
    </VStack>
  );
};

export const StepperWrapper: FC = ({ children }) => {
  return (
    <VStack align="start" spacing={2}>
      {children}
    </VStack>
  );
};
