import { BigNumber } from "ethers";
import { FC, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/ErrorMessage";
import { Loader } from "../generic/Loader";
import { chainIdToInfo } from "./chainIdToInfo";
import { useEthersProvider } from "./EthersProviderContext";
import { getProposedChainId } from "./getProposedChainId";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

type Props = {
  /** A '0x' prefixed chain */
  chainIds?: string[];
  isConnected?: boolean;
  isNonZeroBalance?: boolean;
};

type Status =
  | "CHECKING"
  | "NOT_CONNECTED_TO_CHAIN"
  | "OK"
  | "WRONG_CHAIN"
  | "NO_ACCOUNT_CONNECTED"
  | "ZERO_BALANCE";

// TODO: Steal some checks from `EthToolbar` like: checking if connected to wallet (not address) and checking for multiple wallets.
// TODO: Probably don't allow multiple instances of this component showing errors at once. Best to cover the entire UI and use React Context to ensure only one is displayed at a time.
export const EnsureConnectionRequirements: FC<Props> = (props) => {
  const { children, ...expect } = props;
  // Need to check chain ID if checking for balance
  if (expect.chainIds) expect.isConnected = true;
  // Need to check connection if checking for balance
  if (expect.isNonZeroBalance) expect.isConnected = true;

  const { loading, data } = useMetaMaskEthereum();
  const provider = useEthersProvider();
  const [status, setStatus] = useState<Status>("CHECKING");
  const handleError = useErrorHandler();

  useEffect(() => {
    const doAsync = async () => {
      // setStatus("CHECKING");
      if (!data.isConnectedToCurrentChain) {
        setStatus("NOT_CONNECTED_TO_CHAIN");
        return;
      }

      // It will try again when data is populated.
      if (!data) return;
      if (typeof data.chainId === "undefined") return;
      if (typeof data.selectedAddressBalance === "undefined") return;

      if (expect.chainIds) {
        if (expect.chainIds.length === 0) {
          throw new Error(
            "If you want to require a set of chain acceptable ids, don't make the variable an empty array."
          );
        }
        if (!data.chainId) {
          throw new Error("Can't connect to network.");
        }
        if (
          !expect.chainIds.includes(BigNumber.from(data.chainId).toString())
        ) {
          setStatus("WRONG_CHAIN");
          return;
        }
      }

      // Connect if we're not connected already
      if (expect.isConnected) {
        if (!data?.selectedAddress) {
          setStatus("NO_ACCOUNT_CONNECTED");
          return;
        }
      }

      // Make sure there's some balance on that account
      if (expect.isNonZeroBalance) {
        const isEmpty = BigNumber.from(data.selectedAddressBalance).isZero();
        if (isEmpty) {
          setStatus("ZERO_BALANCE");
          return;
        }
      }

      setStatus("OK");
    };
    doAsync().catch(handleError);
  }, [
    status,
    expect.isConnected,
    expect.isNonZeroBalance,
    expect.chainIds,
    data,
    data.selectedAddress,
    data.selectedAddressBalance,
    data.chainId,
    handleError,
  ]);

  const fixProblem = async () => {
    if (!provider) return;
    switch (status) {
      case "CHECKING":
        break;
      case "NOT_CONNECTED_TO_CHAIN":
      case "WRONG_CHAIN":
        const proposedChainId = getProposedChainId();
        await provider.send("wallet_switchEthereumChain", [
          { chainId: proposedChainId },
        ]);
        break;
      case "NO_ACCOUNT_CONNECTED":
        await provider.send("eth_requestAccounts", []);
        break;
      case "ZERO_BALANCE":
        await provider.send("wallet_requestPermissions", [
          { eth_accounts: {} },
        ]);
        break;
      case "OK":
      default:
        break;
    }
  };

  if (status === "NOT_CONNECTED_TO_CHAIN") {
    const currentChain = data.chainId;
    if (!currentChain) {
      return <ErrorMessage>No chain detected.</ErrorMessage>;
    }
    return (
      <ErrorMessage>
        Not connected to current chain: {chainIdToInfo(currentChain).name}
      </ErrorMessage>
    );
  }

  if (loading || status === "CHECKING") {
    return (
      <div>
        <Loader>Checking wallet</Loader>
        {/* <pre>{JSON.stringify(data, null, "  ")}</pre> */}
      </div>
    );
  }

  switch (status) {
    case "WRONG_CHAIN": {
      return (
        <div>
          <ErrorMessage>
            Wrong chain. Acceptable chains include: (
            {expect.chainIds?.join(", ")}).
          </ErrorMessage>
          <button onClick={fixProblem}>Choose Correct Chain</button>
        </div>
      );
    }
    case "NO_ACCOUNT_CONNECTED": {
      return (
        <div>
          <ErrorMessage>No account connected.</ErrorMessage>
          <button onClick={fixProblem}>Connect Account</button>
        </div>
      );
    }
    case "ZERO_BALANCE": {
      return (
        <div>
          <ErrorMessage>
            Please choose an account with a non-zero balance.
          </ErrorMessage>
          <button onClick={fixProblem}>Connect Account</button>
        </div>
      );
    }
    case "OK": {
      return <>{children}</>;
    }
    default:
      break;
  }

  return (
    <div>
      <ErrorMessage>Unexpected error.</ErrorMessage>
    </div>
  );
};
