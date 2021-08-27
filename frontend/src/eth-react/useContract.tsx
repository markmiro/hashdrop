import delay from "delay";
import { BaseContract, ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import feArtifacts from "../hardhat-frontend-artifacts.json";
import { useEthersProvider } from "./EthersProviderContext";

type FeContractName = keyof typeof feArtifacts.contract;
type FeContract<C extends FeContractName> = typeof feArtifacts.contract[C];
type FeChainId<C extends FeContractName> = keyof FeContract<C>["chainId"];

export type OnConnect<T extends BaseContract> = (contract: T) => void;

// TODO: Each instance of `useContract()` is unique so they're not going to stay in sync.
// Consider introducing a global reducer to keep things in sync.
export function useContract<T extends BaseContract>(
  contractName: FeContractName,
  onConnect?: OnConnect<T>
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | ReactNode>("");
  const [contract, setContract] = useState<T | null>(null);
  const provider = useEthersProvider();

  useEffect(() => {
    if (!provider) return;

    const doAsync = async () => {
      console.log("doAsync");
      // setError(""); // Not doing this because we don't want to flicker between loading and error
      setLoading(true);

      const feContract = feArtifacts.contract[contractName];
      let chainIdString = (await provider.getNetwork()).chainId.toString();

      // Check for correct type
      {
        const acceptableChainIds = Object.keys(feContract.chainId);
        if (!acceptableChainIds.includes(chainIdString)) {
          setError("Unsupported network");
          throw new Error(
            `\n\nSelected MetaMask network chainId is: ${chainIdString}.\nContract "${
              feContract.name
            }" is only deployed to these: ${acceptableChainIds
              .map((s) => "\n- " + s)
              .join("")}\n`
          );
        }
      }
      // Assign correct type
      const chainId: FeChainId<typeof contractName> = chainIdString as any;
      chainIdString = ""; // Make sure this variable doesn't get used

      const contractAddress = feContract.chainId[chainId].address;
      const contract = new ethers.Contract(
        contractAddress,
        feArtifacts.contract[contractName].abi,
        provider
      ) as T;

      // On hot reload, the component gets re-rendered.
      // If the contract doesn't exist, `contract.deployed()` will throw an exception.
      // Helps to just return if we can't find the contract and not interact with it.
      // This is because interacting with contract yields confusing errors like "call revert exception"... code=CALL_EXCEPTION
      // that seem to come from somewhere deeper than hardhat.
      // https://github.com/ethers-io/ethers.js/issues/214#issuecomment-399838895
      // https://github.com/ethers-io/ethers.js/blob/68229ac0aff790b083717dc73cd84f38d32a3926/packages/contracts/src.ts/index.ts#L809
      try {
        await contract.deployed();
      } catch (err) {
        console.error(err);
        setError(
          <div className="f7">
            Contract '{contractName}' was not found at address: '
            <span className="ttl">{contractAddress}</span>'
          </div>
        );
        return;
      }

      if (onConnect) onConnect(contract);

      // Once we know we can interact with the contract, we update the state.
      setContract(contract);
      await delay(200);
      setError("");
      setLoading(false);
    };
    doAsync();
  }, [contractName, onConnect, provider]);

  return { isLoading: loading, error, contract };
}
