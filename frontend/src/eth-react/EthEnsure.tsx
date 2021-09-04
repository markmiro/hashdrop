import { Button } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { Loader } from "../generic/Loader";
import { ChainOptions } from "./ChainOptions";
import { CurrentChainName } from "./CurrentChainName";
import {
  InstallMetaMaskMessage,
  MultipleWalletsMessage,
  ReloadLink,
} from "./Errors";
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
    return (
      <Loader>
        Checking <CurrentChainName /> wallet
      </Loader>
    );
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
        Not connected to wallet. Check wallet to see if it's working.{" "}
        <ReloadLink />
      </ErrorMessage>
    );
  }

  // User-defined checks
  // ---

  if (expect.isConnectedToChain) {
    if (!data.chainId) {
      return (
        <ErrorMessage>
          Can't connect to network. <ReloadLink />
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
          Not connected to wallet. <ReloadLink />
        </ErrorMessage>
      );
    }
    if (!expect.chainIds.includes(data.chainId)) {
      return (
        <div>
          Please choose a different chain:
          <ChainOptions chainIds={expect.chainIds} />
        </div>
      );
    }
  }

  if (expect.isConnected) {
    if (!data.selectedAddress) {
      const connect = () => {
        ethereum.request({ method: "eth_requestAccounts" }).catch(handleError);
      };
      return (
        <div>
          <Button colorScheme="green" onClick={connect}>
            Connect Account
          </Button>
        </div>
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
          .then(() => window.location.reload())
          .catch(handleError);
      };
      return (
        <div>
          Please choose an account with a non-zero balance.{" "}
          <Button colorScheme="green" onClick={connect}>
            Connect Account
          </Button>
        </div>
      );
    }
  }

  return <>{children}</>;
};
