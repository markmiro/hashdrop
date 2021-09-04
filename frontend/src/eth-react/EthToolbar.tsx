import { Box, Circle, HStack, Spacer } from "@chakra-ui/react";
import { FC } from "react";
import Blockies from "react-blockies";
import { ErrorBoundary, useErrorHandler } from "react-error-boundary";
import { Loader } from "../generic/Loader";
import { chains } from "./chains";
import { InstallMetaMaskMessage, MultipleWalletsMessage } from "./Errors";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";
import {
  prettyAccountBalance,
  prettyBlockNumber,
  prettyGasPrice,
} from "./utils";

const Layout: FC = ({ children }) => (
  <>
    <Box
      bg="black"
      color="white"
      px="1"
      bottom="0"
      right="0"
      position="fixed"
      fontSize="xs"
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="flex-end"
      style={{ gap: ".5em" }}
    >
      <span>eth-toolbar</span>
      {children}
    </Box>
  </>
);

export const ErrorMessageLight: FC = ({ children }) => {
  if (!children) return null;
  return <Box color="red.300">⚠️ {children}</Box>;
};

export function Inner() {
  const handleError = useErrorHandler();
  // Not using useEthersProvider because I want to make EthToolbar possible to embed without the ProviderProvider
  const { loading, data, ethereum } = useMetaMaskEthereum();

  function connectAccount() {
    if (!ethereum) return; // Note: should always exist, but types fail
    ethereum.request({ method: "eth_requestAccounts" }).catch(handleError);
  }

  if (loading) {
    return (
      <>
        <Spacer />
        <Loader />
      </>
    );
  }

  if (!data.isWalletInstalled) {
    return (
      <>
        <Spacer />
        <ErrorMessageLight>
          <InstallMetaMaskMessage />
        </ErrorMessageLight>
      </>
    );
  }

  if (data.hasMultipleWallets) {
    return (
      <>
        <Spacer />
        <ErrorMessageLight>
          <MultipleWalletsMessage />
        </ErrorMessageLight>
      </>
    );
  }

  const chainInfo = data.chainId ? chains.showableById(data.chainId) : null;

  return (
    <>
      {data?.isMetaMask ? (
        <span title="MetaMask">🦊</span>
      ) : (
        <ErrorMessageLight>Not MetaMask!</ErrorMessageLight>
      )}
      <span>/</span>
      {chainInfo && (
        <>
          <Circle w={2} h={2} bg={chainInfo?.color || "transparent"}></Circle>
          {chainInfo.name}
        </>
      )}
      <span>–</span>
      <div title="Block number">
        Block:{prettyBlockNumber(data?.blockNumber)}
      </div>
      <span>–</span>
      <div title="Block number">Gas:{prettyGasPrice(data?.gasPrice)}</div>
      <span>–</span>
      {!data?.isConnectedToCurrentChain && (
        <ErrorMessageLight>Not Connected</ErrorMessageLight>
      )}
      {data?.selectedAddress ? (
        <HStack spacing={1} alignItems="center">
          {data?.selectedAddressBalance && (
            <div>{prettyAccountBalance(data?.selectedAddressBalance)} ETH</div>
          )}
          <Blockies seed={data.selectedAddress} scale={2} />
        </HStack>
      ) : (
        <button onClick={connectAccount}>Connect Wallet</button>
      )}
    </>
  );
}

export const EthToolbar = () => (
  <Layout>
    <ErrorBoundary
      fallback={<ErrorMessageLight>Something went wrong.</ErrorMessageLight>}
    >
      <Inner />
    </ErrorBoundary>
  </Layout>
);
