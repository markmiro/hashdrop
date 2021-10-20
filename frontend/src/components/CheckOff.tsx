import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { HStack, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { FC } from "react";

export type CheckOffStatus = "" | "DONE" | "IN_PROGRESS" | "ERROR";

export const CheckOffItem: FC<{
  status: CheckOffStatus;
  title: string;
}> = ({ status, title, children }) => {
  return (
    <VStack spacing={2}>
      <HStack spacing={1}>
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

export const CheckOffWrapper: FC = ({ children }) => {
  return (
    <VStack align="start" spacing={2}>
      {children}
    </VStack>
  );
};
