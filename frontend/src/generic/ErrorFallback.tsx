import { FC } from "react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="red f7 overflow-scroll">
    <b>⚠️ Something went wrong.</b>
    <div className="pt1" />
    <pre className="mv0">{error.message}</pre>
    <div className="pt1" />
    <button className="f7" onClick={resetErrorBoundary}>
      Try Again
    </button>
  </div>
);
