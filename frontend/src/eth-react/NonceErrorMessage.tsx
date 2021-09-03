import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from "@chakra-ui/react";
import { Anchor } from "../generic/Anchor";

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
