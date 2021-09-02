import { FC } from "react";

export const GenericError: FC<{ tryAgain: () => void }> = ({
  tryAgain,
  children,
}) => {
  return (
    <div className="text-red-500 text-sm overflow-scroll flex flex-col items-start">
      <b>⚠️ Something went wrong.</b>
      <pre className="whitespace-normal">{children}</pre>
      <button className="btn-red" onClick={tryAgain}>
        Try Again
      </button>
    </div>
  );
};
