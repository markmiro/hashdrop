import { ethers } from "ethers";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { Loader } from "../generic/Loader";
import { testProvider } from "./testProvider";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

const EthersProviderContext =
  createContext<ethers.providers.Web3Provider | null>(null);

export const EthersProviderProvider: FC = ({ children }) => {
  const handleError = useErrorHandler();
  const { loading, ethereum } = useMetaMaskEthereum();
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    if (!ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      setProvider(provider);
      // testProvider(provider)
      //   .then(() => setProvider(provider))
      //   .catch(handleError);
    } catch (err) {
      handleError(err);
    }
  }, [ethereum, handleError]);

  if (loading) return <Loader />;

  if (!provider) <></>;

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
