import { ethers } from "ethers";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/ErrorMessage";
import { Loader } from "../generic/Loader";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

const CONNECTION_TIMEOUT = 5000;

/*
Try to get block number to test if a connection can be made.
If it time's out then throw an error.
*/
function testProvider(provider: ethers.providers.Web3Provider) {
  return new Promise<boolean>((resolve, reject) => {
    let blockNumber: number | null = null;

    const connectionError = () => {
      const err = Error("Provider can't connect to network.");
      reject(err);
    };

    provider
      .getBlockNumber()
      .then((block) => {
        blockNumber = block;
        resolve(true);
      })
      .catch(connectionError);
    setTimeout(() => {
      if (!blockNumber) {
        connectionError();
      }
    }, CONNECTION_TIMEOUT);
  });
}

const EthersProviderContext =
  createContext<ethers.providers.Web3Provider | null>(null);

export const EthersProviderProvider: FC = ({ children }) => {
  const handleError = useErrorHandler();
  const { loading, uiError, ethereum } = useMetaMaskEthereum();
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    if (!ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      testProvider(provider)
        .then(() => setProvider(provider))
        .catch(handleError);
    } catch (err) {
      handleError(err);
    }
  }, [ethereum, handleError]);

  if (loading) return <Loader />;
  if (uiError) return <ErrorMessage>{uiError}</ErrorMessage>;
  // Doing this for redundancy, but window.ethereum should always exist after loading is done
  if (!ethereum) throw new Error("window.ethereum is missing.");

  return (
    <EthersProviderContext.Provider value={provider}>
      {children}
    </EthersProviderContext.Provider>
  );
};

export function useEthersProvider() {
  const provider = useContext(EthersProviderContext);
  if (!provider) {
    throw new Error(
      "`useEthersProvider()` Should have <EthersProviderProvider /> above it somewhere."
    );
  }
  return provider;
}
