import { Button } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { Loader } from "../generic/Loader";
import { ChainOptions } from "./ChainOptions";
import { InstallMetaMaskMessage, MultipleWalletsMessage } from "./Errors";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

type Props = {
  isConnectedToChain?: boolean;
  chainIds?: number[];
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
        <Button onClick={() => window.location.reload()}>Reload</Button>
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
          <Button onClick={() => window.location.reload()}>Reload</Button>
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
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </ErrorMessage>
      );
    }
    if (!expect.chainIds.includes(data.chainId)) {
      return (
        <ErrorMessage>
          Please choose a different chain:
          <ChainOptions chainIds={expect.chainIds} />
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
          <Button onClick={connect}>Connect Account</Button>
        </ErrorMessage>
      );
    }
  }

  if (expect.isNonZeroBalance) {
    const isEmpty =
      !data.selectedAddressBalance ||
      BigNumber.from(data.selectedAddressBalance).isZero();
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
          <Button onClick={connect}>Connect Account</Button>
        </ErrorMessage>
      );
    }
  }

  return <>{children}</>;
};
