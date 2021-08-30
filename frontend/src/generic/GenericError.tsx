import { FC } from "react";

export const GenericError: FC<{ tryAgain: () => void }> = ({
  tryAgain,
  children,
}) => {
  return (
    <div className="red f7 overflow-scroll">
      <b>⚠️ Something went wrong.</b>
      <div className="pt1" />
      <pre className="mv0 ws-normal">{children}</pre>
      <div className="pt1" />
      <button className="f7" onClick={tryAgain}>
        Try Again
      </button>
    </div>
  );
};
