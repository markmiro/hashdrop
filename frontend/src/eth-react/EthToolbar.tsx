import { FC } from "react";
import Blockies from "react-blockies";
import { ErrorBoundary, useErrorHandler } from "react-error-boundary";
import { Loader } from "../generic/Loader";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

// Colors from MetaMask
const chainIdToInfoMap = {
  "0x1": { name: "Mainnet", type: "prod", color: "#29b6af" },
  "0x3": { name: "Ropsten", type: "test", color: "#ff4a8d" },
  "0x2a": { name: "Kovan", type: "test", color: "#9064ff" },
  "0x4": { name: "Rinkeby", type: "test", color: "#f6c343" },
  "0x5": { name: "Goerli", type: "test", color: "#3099f2" },
  "0x539": { name: "localhost:8545", type: "test", color: "#d6d9dc" },
  custom: { name: "Custom", type: "", color: "#29b6af" },
};

type ChainId = keyof typeof chainIdToInfo;

function chainIdToInfo(chainId: string) {
  if (!chainId) return null;

  if (Object.keys(chainIdToInfoMap).includes(chainId)) {
    return chainIdToInfoMap[chainId as ChainId];
  }
  return chainIdToInfoMap.custom;
}

const Layout: FC = ({ children }) => (
  <>
    <div className="h4" />
    <div
      className="bg-black white ph2 fixed bottom-0 right-0 f7 flex items-center flex-wrap justify-end"
      style={{ lineHeight: "2", gap: ".3em" }}
    >
      <span>eth-toolbar</span>
      {children}
    </div>
  </>
);

export function Inner() {
  const handleError = useErrorHandler();
  // Not using useEthersProvider because I want to make EthToolbar possible to embed without the ProviderProvider
  const { loading, uiError, data, ethereum } = useMetaMaskEthereum();

  function connectAccount() {
    if (!ethereum) return; // Note: should always exist, but types fail
    ethereum.request({ method: "eth_requestAccounts" }).catch(handleError);
  }

  if (uiError) {
    return (
      <>
        <div className="flex-auto" />
        <span className="light-red">⚠️ Error: {uiError}</span>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="flex-auto" />
        <Loader />
      </>
    );
  }

  const chainInfo = chainIdToInfo(data?.chainId);

  return (
    <>
      {data.isMetaMask ? (
        <span title="MetaMask">🦊</span>
      ) : (
        <span className="red">Not MetaMask!</span>
      )}
      <span>/</span>
      {chainInfo && (
        <>
          <span
            className="h1 w1 br-pill"
            style={{
              background: chainInfo?.color || "transparent",
            }}
          ></span>
          {chainInfo.name}
        </>
      )}
      <span>–</span>
      <div title="Block number">Block:{data.blockNumber}</div>
      <span>–</span>
      <div title="Block number">Gas:{data.gasPrice}</div>
      <span>–</span>
      {!data.isConnectedToCurrentChain && (
        <span className="light-red">Not Connected</span>
      )}
      {data.selectedAddress ? (
        <div className="flex items-center" style={{ gap: ".3em" }}>
          {data.selectedAddressBalance && (
            <div>{data.selectedAddressBalance} ETH</div>
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
      fallback={<div className="light-red">⚠️ Something went wrong.</div>}
    >
      <Inner />
    </ErrorBoundary>
  </Layout>
);
