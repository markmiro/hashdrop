import { FC, ReactNode } from "react";
import { FallbackProps } from "react-error-boundary";
import { NonceErrorMessage } from "../eth-react/NonceErrorMessage";
import { GenericError } from "../generic/GenericError";

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
