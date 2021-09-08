import { Center, Image } from "@chakra-ui/react";
import { ethers } from "ethers";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { Loader } from "../generic/Loader";
import { InstallMetaMaskMessage, ReloadLink } from "./Errors";
// import { testProvider } from "./testProvider";
import metamaskLogo from "./metamask-fox.svg";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

const EthersProviderContext = createContext<
  ethers.providers.Web3Provider | "ERROR"
>("ERROR");

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
    } catch (err) {
      handleError(err);
    }
  }, [ethereum, handleError]);

  if (loading) {
    return (
      <Center position="fixed" w="100%" h="100vh" top={0} left={0}>
        <Loader>Connecting</Loader>
      </Center>
    );
  }

  if (!ethereum) {
    return (
      <Center
        position="fixed"
        w="100%"
        h="100vh"
        top={0}
        left={0}
        flexDir="column"
      >
        <ErrorMessage>
          Failed to connect. <ReloadLink />
        </ErrorMessage>
        <Image boxSize="50px" src={metamaskLogo} />
        <InstallMetaMaskMessage />
      </Center>
    );
  }

  if (!provider) {
    return (
      <Center position="fixed" w="100%" h="100vh" top={0} left={0}>
        <ErrorMessage>Error connecting.</ErrorMessage> <ReloadLink />
      </Center>
    );
  }

  return (
    <EthersProviderContext.Provider value={provider}>
      {children}
    </EthersProviderContext.Provider>
  );
};

export function useEthersProvider() {
  const provider = useContext(EthersProviderContext);
  if (provider === "ERROR") {
    throw new Error(
      "useEthersProvider() should be used within an <EthersProviderProvider />."
    );
  }
  return provider;
}
