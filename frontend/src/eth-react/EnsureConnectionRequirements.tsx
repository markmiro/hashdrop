import { BigNumber } from "ethers";
import { FC, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { ErrorMessage } from "../generic/ErrorMessage";
import { Loader } from "../generic/Loader";
import { useEthersProvider } from "./EthersProviderContext";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

// const problems = (provider: ethers.providers.Web3Provider) => ({
//   WRONG_CHAIN: {
//     check: () => {},
//     fix: async () => {
//       // TODO: Make user select one
//       await provider.send("wallet_switchEthereumChain", [{ chainId: "0x1" }]);
//     },
//     render: (fix: any) => (
//       <div>
//         <ErrorMessage>Wrong chain.</ErrorMessage>
//         <button onClick={fix}>Choose Correct Chain</button>
//       </div>
//     ),
//   },
//   NO_ACCOUNT_CONNECTED: {
//     check: async () => {
//       const addresses = await provider.listAccounts();
//       debugger;
//       return addresses.length === 0;
//     },
//     fix: async () => {
//       await provider.send("eth_requestAccounts", []);
//     },
//     render: (fix: any) => (
//       <div>
//         <ErrorMessage>No account connected.</ErrorMessage>
//         <button onClick={fix}>Connect Account</button>
//       </div>
//     ),
//   },
//   ZERO_BALANCE: {
//     check: async () => {},
//     fix: async () => {
//       await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
//     },
//     render: (fix: any) => (
//       <div>
//         <ErrorMessage>
//           Please choose an account with a non-zero balance.
//         </ErrorMessage>
//         <button onClick={fix}>Connect Account</button>
//       </div>
//     ),
//   },
// });

type Props = {
  /** A '0x' prefixed chain */
  chainIds?: string[];
  isConnected?: boolean;
  isNonZeroBalance?: boolean;
};

type Status =
  | "CHECKING"
  | "OK"
  | "WRONG_CHAIN"
  | "NO_ACCOUNT_CONNECTED"
  | "ZERO_BALANCE";

// TODO: Steal some checks from `EthToolbar` like: checking if connected to wallet (not address) and checking for multiple wallets.
export const EnsureConnectionRequirements: FC<Props> = (props) => {
  const { children, ...expect } = props;
  // Need to check chain ID if checking for balance
  if (expect.chainIds) expect.isConnected = true;
  // Need to check connection if checking for balance
  if (expect.isNonZeroBalance) expect.isConnected = true;

  const { loading, uiError, data } = useMetaMaskEthereum();
  const provider = useEthersProvider();
  const [status, setStatus] = useState<Status>("CHECKING");
  const handleError = useErrorHandler();

  useEffect(() => {
    setStatus("CHECKING");
    const doAsync = async () => {
      try {
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
            !expect.chainIds.includes(parseInt(data.chainId, 16).toString())
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
      } catch (err) {
        handleError(err);
      }
    };
    doAsync();
  }, [
    expect.isConnected,
    expect.isNonZeroBalance,
    expect.chainIds,
    data.selectedAddress,
    data.selectedAddressBalance,
    data.chainId,
    handleError,
  ]);

  const fixProblem = async () => {
    switch (status) {
      case "CHECKING":
        break;
      case "WRONG_CHAIN":
        // https://docs.metamask.io/guide/rpc-api.html#wallet-switchethereumchain
        // "0x"+(1337).toString(16) === "0x539"
        let proposedChainId = "0x1"; // Mainnet
        if (process.env.NODE_ENV === "development") {
          proposedChainId = "0x539"; // 1337 - localhost
        } else if (process.env.NODE_ENV === "test") {
          proposedChainId = "0x3"; // Ropsten
        }
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

  if (loading || status === "CHECKING") {
    return (
      <div>
        <Loader>Checking wallet</Loader>
      </div>
    );
  }

  if (uiError) {
    return <ErrorMessage>⚠️ Error: {uiError}</ErrorMessage>;
  }

  switch (status) {
    case "WRONG_CHAIN":
      return (
        <div>
          <ErrorMessage>
            Wrong chain. Acceptable chains include: (
            {expect.chainIds?.join(", ")})
          </ErrorMessage>
          <button onClick={fixProblem}>Choose Correct Chain</button>
        </div>
      );
    case "NO_ACCOUNT_CONNECTED":
      return (
        <div>
          <ErrorMessage>No account connected.</ErrorMessage>
          <button onClick={fixProblem}>Connect Account</button>
        </div>
      );
    case "ZERO_BALANCE":
      return (
        <div>
          <ErrorMessage>
            Please choose an account with a non-zero balance.
          </ErrorMessage>
          <button onClick={fixProblem}>Connect Account</button>
        </div>
      );
    case "OK":
      return <>{children}</>;
    default:
      break;
  }

  return (
    <div>
      <ErrorMessage>Unexpected error.</ErrorMessage>
    </div>
  );
};
