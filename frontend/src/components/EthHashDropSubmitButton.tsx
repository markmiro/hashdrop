import delay from "delay";
import { useCallback, useEffect, useState } from "react";
import type { ContractTransaction } from "ethers";
import { AddressLink } from "../eth-react/AddressLink";
import { useContract } from "../eth-react/useContract";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { ErrorMessage } from "../generic/ErrorMessage";
import { Loader } from "../generic/Loader";
import { Disabled } from "../generic/Disabled";
import { HashDrop as T } from "../typechain";

export function EthHashDropSubmitButton({
  cid,
  privateCid,
  onSubmitComplete,
}: {
  cid: string;
  privateCid: string;
  onSubmitComplete: (tx: ContractTransaction) => void;
}) {
  const provider = useEthersProvider();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setDropCount((await hashdrop.contract.dropCount()).toNumber());
      setLoadingDropCount(false);
    };
    doAsync();
  }, [hashdrop.contract]);

  useEffect(fetchDropCount, [fetchDropCount]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError("");
    setIsSubmitting(true);
    if (!hashdrop.contract) throw new Error("Contract isn't set yet");
    try {
      const signer = provider.getSigner();
      const tx = await hashdrop.contract
        .connect(signer)
        .addPrivate(cid, privateCid);
      await tx.wait();
      fetchDropCount();
      onSubmitComplete(tx);
    } catch (err) {
      setSubmitError(err.message);
    }
    setIsSubmitting(false);
  };

  if (hashdrop.isLoading) return <Loader>Loading contract</Loader>;
  if (!hashdrop.contract) return <>No contract</>;

  return (
    <div>
      <AddressLink address={hashdrop.contract?.address} />
      <div className="w-full">
        <Disabled className="w-full" disabled={isSubmitting}>
          <form onSubmit={handleSubmit}>
            <button className="btn-blue" type="submit">
              Submit
            </button>
            <div className="flex flex-col gap-2">
              <ErrorMessage>{submitError}</ErrorMessage>
              {!submitError && submitSuccess && (
                <div className="text-green-500">
                  Hash drop added successfully!
                </div>
              )}
              <div className="text-xs">
                Total drops: {loadingDropCount ? <Loader /> : dropCount}
              </div>
            </div>
          </form>
        </Disabled>
      </div>
    </div>
  );
}
