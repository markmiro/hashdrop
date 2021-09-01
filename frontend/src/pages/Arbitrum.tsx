import { utils } from "ethers";
import { useErrorHandler } from "react-error-boundary";
import { useEthersProvider } from "../eth-react/EthersProviderContext";

export function Arbitrum() {
  const handleError = useErrorHandler();
  const provider = useEthersProvider();

  const connectRinkeby = () => {
    // https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
    provider
      .send("wallet_addEthereumChain", [
        {
          chainName: "Arbitrum Testnet Rinkeby",
          chainId: utils.hexValue(421611),
          nativeCurrency: {
            name: "Arbitrum Rinkeby Ether",
            symbol: "ARETH",
            decimals: 18,
          },
          rpcUrls: [
            "https://rinkeby.arbitrum.io/rpc",
            "wss://rinkeby.arbitrum.io/ws",
          ],
          blockExplorerUrls: ["https://rinkeby-explorer.arbitrum.io"],
        },
      ])
      .then((res) => console.log(res))
      .catch(handleError);
  };

  const connect = () => {
    // https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
    provider
      .send("wallet_addEthereumChain", [
        {
          chainName: "Arbitrum One",
          chainId: utils.hexValue(42161),
          nativeCurrency: {
            name: "Arbitrum Ether",
            symbol: "AETH",
            decimals: 18,
          },
          rpcUrls: ["https://arb1.arbitrum.io/rpc"],
          blockExplorerUrls: ["https://arbiscan.io"],
        },
      ])
      .then((res) => console.log(res))
      .catch(handleError);
  };

  return (
    <div>
      Arbitrum
      <button onClick={connectRinkeby}>Connect to Arbitrum Rinkeby</button>
      <button onClick={connect}>Connect to Arbitrum</button>
    </div>
  );
}
