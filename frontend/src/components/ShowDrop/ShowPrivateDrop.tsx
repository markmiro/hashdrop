import { FC } from "react";
import { ErrorMessage } from "../../generic/ErrorMessage";
import { Loader } from "../../generic/Loader";
import { IFramePreview } from "../IFramePreview";
import { useCheckIpfsCidExists } from "./useCheckIpfsCidExists";
import { DecrypterState, useDecrypter } from "./useDecrypter";

const StateText: FC<{ state: DecrypterState }> = ({ state }) => {
  switch (state) {
    case "INITIAL":
      return <div>None</div>;
    case "LOADING":
      return <Loader>Loading file</Loader>;
    case "DECRYPTING":
      return <Loader>Decrypting</Loader>;
    case "DECRYPTED":
      return <div>Decrypted</div>;
    case "PUBLISHING":
      return <Loader>Publishing</Loader>;
    case "PUBLISHED":
      return <div>Published</div>;
    default:
      throw new Error("Not allowed.");
  }
};

function IFramePreview2({
  cid,
  privateCid,
}: {
  cid: string;
  privateCid: string;
}) {
  const decrypter = useDecrypter();

  return (
    <div className="flex flex-col gap-2">
      <button
        className="btn-light"
        onClick={() => decrypter.decrypt(cid, privateCid)}
      >
        Show Your Encrypted File
      </button>
      {decrypter.dataUrl && (
        <>
          <IFramePreview src={decrypter.dataUrl} />
          <button className="btn-blue p-2 w-full" onClick={decrypter.publish}>
            Publish
          </button>
        </>
      )}
      <div className="p-1 bg-black bg-opacity-5 flex gap-2">
        Status: <StateText state={decrypter.state} />
      </div>
    </div>
  );
}

export function ShowMyPrivateDrop({
  cid,
  privateCid,
}: {
  cid: string;
  privateCid: string;
}) {
  const cidChecker = useCheckIpfsCidExists(privateCid);

  return (
    <div>
      {cidChecker.state === "LOADING" && (
        <Loader>Checking IPFS for encrypted file</Loader>
      )}
      {cidChecker.state === "NOT_FOUND" && (
        <ErrorMessage>
          Couldn't find the document.{" "}
          <button className="btn-red" onClick={cidChecker.checkAgain}>
            Try Again
          </button>
        </ErrorMessage>
      )}
      {cidChecker.state === "FOUND" && (
        <IFramePreview2 cid={cid} privateCid={privateCid} />
      )}
    </div>
  );
}
