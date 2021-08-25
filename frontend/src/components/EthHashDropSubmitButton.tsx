import delay from "delay";
import { useCallback, useEffect, useState } from "react";
import type { ContractTransaction } from "ethers";
import { AddressLink } from "../eth-react/AddressLink";
import { useContract } from "../eth-react/useContract";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { ErrorMessage } from "../generic/ErrorMessage";
import { Loader } from "../generic/Loader";
import { Pulse } from "../generic/Pulse";
import { HashDrop as T } from "../typechain";

export function EthHashDropSubmitButton({
  id,
  cid,
  onSubmitComplete,
}: {
  id: string;
  cid: string;
  onSubmitComplete: (tx: ContractTransaction) => void;
}) {
  const provider = useEthersProvider();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const hashdrop = useContract<T>("HashDrop");
  const [dropCount, setDropCount] = useState(0);
  const [loadingDropCount, setLoadingDropCount] = useState(false);

  const fetchDropCount = useCallback(() => {
    console.log("attempt fetch drop count");
    const doAsync = async () => {
      if (!hashdrop.contract) return;
      console.log("fetch drop count");
      setLoadingDropCount(true);
      await delay(200);
      setDropCount((await hashdrop.contract.numDrops()).toNumber());
      setLoadingDropCount(false);
    };
    doAsync();
  }, [hashdrop.contract]);

  useEffect(fetchDropCount, [fetchDropCount]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError("");
    setIsAdding(true);
    if (!hashdrop.contract) throw new Error("Contract isn't set yet");
    try {
      const signer = provider.getSigner();
      const tx = await hashdrop.contract.connect(signer).add({ id, cid });
      await tx.wait();
      fetchDropCount();
      onSubmitComplete(tx);
    } catch (err) {
      setSubmitError(err.message);
    }
    setIsAdding(false);
  };

  if (hashdrop.error) return <ErrorMessage>{hashdrop.error}</ErrorMessage>;
  if (hashdrop.isLoading) return <Loader>Loading contract</Loader>;
  if (!hashdrop.contract) return <>No contract</>;

  return (
    <>
      <AddressLink address={hashdrop.contract?.address} />
      <div className="w-100">
        <Pulse className="w-100" pulsing={isAdding}>
          <form onSubmit={handleSubmit}>
            <button type="submit">Submit</button>
            <div className="flex flex-column" style={{ gap: ".5em" }}>
              <ErrorMessage>{submitError}</ErrorMessage>
              {!submitError && submitSuccess && (
                <div className="green">Hash drop added successfully!</div>
              )}
              <div className="f7">
                Total drops: {loadingDropCount ? <Loader /> : dropCount}
              </div>
            </div>
          </form>
        </Pulse>
      </div>
    </>
  );
}
