import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import { FallbackProps } from "react-error-boundary";
import { Anchor } from "../generic/Anchor";
import { GenericError } from "../generic/Errors/GenericError";

export function MultipleWalletsMessage() {
  return <>Do you have multiple wallets installed?</>;
}

export function InstallMetaMaskMessage() {
  return (
    <Anchor to="https://metamask.io/download" isExternal>
      Install MetaMask
    </Anchor>
  );
}

export function NonceErrorMessage({
  originalMessage,
}: {
  originalMessage: string;
}) {
  return (
    <div>
      <Alert
        status="error"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <AlertIcon />
        <AlertTitle>Transaction failed.</AlertTitle>
        <AlertDescription>
          <div>{originalMessage}</div>
          <Box bg="white" color="black" p="2">
            <b>
              <Anchor
                textDecor="underline"
                to="https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet"
              >
                Try resetting your wallet
              </Anchor>
              .
            </b>
            <p>
              🦊 → (account icon on the top right) → Settings → Advanced → Reset
              Account.
            </p>
            <p>Then refresh the page.</p>
          </Box>
        </AlertDescription>
      </Alert>
    </div>
  );
}

const ensureError = (error: any) =>
  "message" in error && typeof error.message === "string";

export const EthErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  // Consider using this: https://www.npmjs.com/package/eth-rpc-errors
  let message: ReactNode;
  if (ensureError(error)) {
    message = error.message;
    if (process.env.NODE_ENV === "development") {
      // Rewrite error
      if (error.message.includes("Nonce too high")) {
        message = <NonceErrorMessage originalMessage={error.message} />;
      }
    }
  }

  return <GenericError tryAgain={resetErrorBoundary}>{message}</GenericError>;
};
