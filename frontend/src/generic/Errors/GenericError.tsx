import { Button, Flex, Text } from "@chakra-ui/react";
import { FC } from "react";

export const GenericError: FC<{ tryAgain?: () => void }> = ({
  tryAgain,
  children,
}) => {
  return (
    <Flex color="red.500" overflow="scroll" flexDir="column" alignItems="start">
      <Flex fontWeight="semibold" flexWrap="wrap" alignItems="center">
        {/* <WarningIcon boxSize=".75em" color="red.500" mr="1" /> */}
        ⚠️ Something went wrong.
      </Flex>
      <Text as="pre" fontFamily="mono">
        {children}
      </Text>
      {tryAgain && (
        <Button
          variant="outline"
          size="xs"
          colorScheme="red"
          onClick={tryAgain}
        >
          Try Again
        </Button>
      )}
    </Flex>
  );
};
