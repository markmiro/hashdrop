import { FC } from "react";
import Blockies from "react-blockies";
import { ErrorBoundary, useErrorHandler } from "react-error-boundary";
import { Loader } from "../generic/Loader";
import { chainIdToInfo } from "./chainIdToInfo";
import {
  prettyAccountBalance,
  prettyBlockNumber,
  prettyGasPrice,
} from "./utils";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";
import { InstallMetaMaskMessage } from "./InstallMetaMaskMessage";
import { MultipleWalletsMessage } from "./MultipleWalletsMessage";

const Layout: FC = ({ children }) => (
  <>
    <div className="h-4" />
    <div className="bg-black text-white px-1 fixed bottom-0 right-0 text-xs flex gap-1 items-center flex-wrap justify-end">
      <span>eth-toolbar</span>
      {children}
    </div>
  </>
);

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
        <div className="flex-auto" />
        <Loader />
      </>
    );
  }

  if (!data.isWalletInstalled) {
    return (
      <>
        <div className="flex-auto" />
        <span className="text-red-300">
          ⚠️ Error: <InstallMetaMaskMessage />
        </span>
      </>
    );
  }

  if (data.hasMultipleWallets) {
    return (
      <>
        <div className="flex-auto" />
        <span className="text-red-300">
          ⚠️ Error: <MultipleWalletsMessage />
        </span>
      </>
    );
  }

  const chainInfo = data.chainId ? chainIdToInfo(data.chainId) : null;

  return (
    <>
      {data?.isMetaMask ? (
        <span title="MetaMask">🦊</span>
      ) : (
        <span className="text-red-300">Not MetaMask!</span>
      )}
      <span>/</span>
      {chainInfo && (
        <>
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: chainInfo?.color || "transparent",
            }}
          ></span>
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
        <span className="text-red-300">Not Connected</span>
      )}
      {data?.selectedAddress ? (
        <div className="flex items-center gap-1">
          {data?.selectedAddressBalance && (
            <div>{prettyAccountBalance(data?.selectedAddressBalance)} ETH</div>
          )}
          <Blockies seed={data.selectedAddress} scale={2} />
        </div>
      ) : (
        <button onClick={connectAccount}>Connect Account</button>
      )}
    </>
  );
}

export const EthToolbar = () => (
  <Layout>
    <ErrorBoundary
      fallback={<div className="text-red-300">⚠️ Something went wrong.</div>}
    >
      <Inner />
    </ErrorBoundary>
  </Layout>
);
