import delay from "delay";
import { BaseContract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import feArtifacts from "../hardhat-frontend-artifacts.json";

import { useEthersProvider } from "./EthersProviderContext";

type FeContractName = keyof typeof feArtifacts.contract;
type FeContract<C extends FeContractName> = typeof feArtifacts.contract[C];
type FeChainId<C extends FeContractName> = keyof FeContract<C>["chainId"];

export type OnConnect<T extends BaseContract> = (contract: T) => void;

// TODO: Each instance of `useContract()` is unique so they're not going to stay in sync.
// Consider introducing a global reducer to keep things in sync.
// TODO: Consider adding a "signer" via `contract.connect(signer)` so that it doesn't
// have to be supplied externally when using the contract provided by this hook.
export function useContract<T extends BaseContract>(
  contractName: FeContractName,
  onConnect?: OnConnect<T>
) {
  const handleError = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<T | null>(null);
  const provider = useEthersProvider();

  useEffect(() => {
    if (!provider) return;

    const doAsync = async () => {
      console.log("doAsync");
      setLoading(true);

      const feContract = feArtifacts.contract[contractName];
      let chainIdString = provider.network.chainId.toString();

      // Check for correct type
      {
        const acceptableChainIds = Object.keys(feContract.chainId);
        if (!acceptableChainIds.includes(chainIdString)) {
          throw new Error(
            `Selected MetaMask network chainId is: ${chainIdString}.\nContract "${
              feContract.name
            }" is only deployed to these: ${acceptableChainIds
              .map((s) => "\n- " + s)
              .join("")}\n`
          );
        }
      }
      // Assign correct type
      const chainId: FeChainId<typeof contractName> = chainIdString as any;
      chainIdString = "DO_NOT_USE"; // Make sure this variable doesn't get used

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
        // You might not think you want this error to show in the UI in production, but you do. It means something about the deployment went terribly wrong and you should definitely know about it.
        handleError(
          new Error(
            `Contract '${contractName}' was not found at address: ${contractAddress}. This is likely because you're on a test network and need to deploy your contract to it. You're on chain ID: ${chainId}`
          )
        );
        return;
      }

      if (onConnect) onConnect(contract);

      // Once we know we can interact with the contract, we update the state.
      setContract(contract);
      await delay(200);
      setLoading(false);
    };
    doAsync().catch(handleError);
  }, [contractName, onConnect, provider, handleError]);

  return { isLoading: loading, contract };
}
