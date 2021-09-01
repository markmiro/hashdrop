import { BigNumber } from "ethers";
import { FC } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/ErrorMessage";
import { Loader } from "../generic/Loader";
import { getProposedChainId } from "./getProposedChainId";
import { InstallMetaMaskMessage } from "./InstallMetaMaskMessage";
import { MultipleWalletsMessage } from "./MultipleWalletsMessage";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

type Props = {
  isConnectedToChain?: boolean;
  /** A '0x' prefixed chain */
  chainIds?: string[];
  isConnected?: boolean;
  isNonZeroBalance?: boolean;
};

export const EthEnsure: FC<Props> = (props) => {
  const { children, ...expect } = props;
  // Need to check connection if expecting to be connected to a specific chain id
  if (expect.chainIds) expect.isConnected = true;
  // Need to check connection if checking for balance
  if (expect.isNonZeroBalance) expect.isConnected = true;

  const handleError = useErrorHandler();
  const { loading, data, ethereum } = useMetaMaskEthereum();

  if (loading) {
    return <Loader>Checking Ethereum wallet</Loader>;
  }

  // Basic checks
  // ---

  if (!ethereum) {
    return (
      <ErrorMessage>
        <InstallMetaMaskMessage />
      </ErrorMessage>
    );
  }

  if (data.hasMultipleWallets) {
    return (
      <ErrorMessage>
        <MultipleWalletsMessage />
      </ErrorMessage>
    );
  }

  // NOTE: This doesn't happen very often
  if (!data.isConnectedToCurrentChain) {
    return (
      <ErrorMessage>
        Not connected to wallet.{" "}
        <button onClick={() => window.location.reload()}>Reload</button>
      </ErrorMessage>
    );
  }

  // User-defined checks
  // ---

  if (expect.isConnectedToChain) {
    if (!data.chainId) {
      return (
        <ErrorMessage>
          Can't connect to network.{" "}
          <button onClick={() => window.location.reload()}>Reload</button>
        </ErrorMessage>
      );
    }
  }

  if (expect.chainIds) {
    if (expect.chainIds.length === 0) {
      throw new TypeError(
        "If you want to require a set of chain acceptable ids, don't make the variable an empty array."
      );
    }
    if (!data.chainId) {
      return (
        <ErrorMessage>
          Not connected to wallet.{" "}
          <button onClick={() => window.location.reload()}>Reload</button>
        </ErrorMessage>
      );
    }
    if (!expect.chainIds.includes(parseInt(data.chainId, 16).toString())) {
      const fixChain = async () => {
        const proposedChainId = getProposedChainId();
        await ethereum
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: proposedChainId }],
          })
          .catch(handleError);
      };
      return (
        <ErrorMessage>
          Wrong chain. Acceptable chains include: ({expect.chainIds?.join(", ")}
          ).
          <button onClick={fixChain}>Choose Correct Chain</button>
        </ErrorMessage>
      );
    }
  }

  if (expect.isConnected) {
    if (!data.selectedAddress) {
      const connect = () => {
        ethereum.request({ method: "eth_requestAccounts" }).catch(handleError);
      };
      return (
        <ErrorMessage>
          <button onClick={connect}>Connect Account</button>
        </ErrorMessage>
      );
    }
  }

  if (expect.isNonZeroBalance) {
    const isEmpty = BigNumber.from(data.selectedAddressBalance).isZero();
    if (isEmpty) {
      const connect = () => {
        ethereum
          .request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          })
          .catch(handleError);
      };
      return (
        <ErrorMessage>
          Please choose an account with a non-zero balance.{" "}
          <button onClick={connect}>Connect Account</button>
        </ErrorMessage>
      );
    }
  }

  return <>{children}</>;
};
