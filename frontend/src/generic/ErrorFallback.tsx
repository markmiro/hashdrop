import { FC } from "react";
import { FallbackProps } from "react-error-boundary";
import { GenericError } from "./GenericError";

export const ErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <GenericError tryAgain={resetErrorBoundary}>{error.message}</GenericError>
);
