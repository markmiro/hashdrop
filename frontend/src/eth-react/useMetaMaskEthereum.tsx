import detectEthereumProvider from "@metamask/detect-provider";
import type { BaseProvider } from "@metamask/providers";
import delay from "delay";
import _ from "lodash";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { testConnection } from "./testConnection";

type Data = {
  isWalletInstalled: boolean;
  hasMultipleWallets: boolean;
  isConnectedToCurrentChain: boolean;
  isMetaMask: boolean;
  chainId: number | undefined;
  selectedAddress: string | undefined;
  selectedAddressBalance: string | undefined;
  blockNumber: string | undefined;
  gasPrice: string | undefined;
};

type MetaMaskType = {
  loading: boolean;
  data: Data;
  ethereum: BaseProvider | null;
};

const MetaMaskContext = createContext<MetaMaskType | null>(null);

export const MetaMaskProvider: FC<{ reloadOnChainChanged: boolean }> = ({
  children,
  reloadOnChainChanged = true,
}) => {
  const handleError = useErrorHandler();
  const [ethereum, setEthereum] = useState<BaseProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data>({
    isWalletInstalled: false,
    hasMultipleWallets: false,
    isConnectedToCurrentChain: false,
    isMetaMask: false,
    chainId: undefined,
    selectedAddress: undefined,
    selectedAddressBalance: undefined,
    blockNumber: undefined,
    gasPrice: undefined,
  });

  // A little based on this:
  // https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
  useEffect(() => {
    const doAsync = async () => {
      setLoading(true);
      await delay(100);
      const ethereum = (await detectEthereumProvider()) as BaseProvider;

      if (!ethereum) {
        setData((d) => ({
          ...d,
          isWalletInstalled: !!ethereum,
        }));
        setLoading(false);
        return;
      }
      setEthereum(ethereum);

      const isConnected = await testConnection(ethereum);
      if (!isConnected) {
        setLoading(false);
        return;
      }

      const chainId = await ethereum.request<string>({
        method: "eth_chainId",
      });
      const blockNumber = await ethereum.request<string>({
        method: "eth_blockNumber",
        params: [],
      });
      const gasPrice = await ethereum.request<string>({
        method: "eth_gasPrice",
        params: [],
      });
      const addresses = await ethereum.request<string[]>({
        method: "eth_accounts",
      });
      const selectedAddress =
        addresses && addresses.length ? addresses[0] : undefined;

      const data = {
        isWalletInstalled: !!ethereum,
        hasMultipleWallets: ethereum !== window.ethereum,
        // TODO: I've had this return false when I start a local hardhat node and
        // the frontend picks up the connection, but MetaMask continues to hang
        // until I disconnect from the localhost chain and connect back.
        isConnectedToCurrentChain: ethereum.isConnected(),
        isMetaMask: (ethereum as any).isMetaMask,
        chainId: chainId ? parseInt(chainId) : undefined,
        selectedAddress,
        selectedAddressBalance: undefined,
        blockNumber: blockNumber ?? undefined,
        gasPrice: gasPrice ?? undefined,
      };
      console.log(data);
      setData(data);

      if (reloadOnChainChanged) {
        ethereum.on("chainChanged", () => {
          document.getElementsByTagName("body")[0].style.transition =
            "200ms ease-out opacity";
          document.getElementsByTagName("body")[0].style.opacity = "0.2";
          window.location.reload();
        });
      }

      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (!accounts || !_.isArray(accounts) || accounts.length === 0) {
          handleError(new Error("No accounts found."));
        }
        setData((d: Data) => ({
          ...d,
          selectedAddress: accounts[0],
        }));
      });

      setLoading(false);
    };
    doAsync().catch(handleError);
  }, [handleError, reloadOnChainChanged]);

  useEffect(() => {
    if (!ethereum) return;
    if (!data?.selectedAddress) return;

    const doAsync = async () => {
      const selectedAddressBalance =
        data.selectedAddress &&
        (await ethereum.request<string>({
          method: "eth_getBalance",
          params: [data.selectedAddress, "latest"],
        }));
      await delay(100);
      setData((d: Data) => ({
        ...d,
        selectedAddressBalance: selectedAddressBalance ?? undefined,
      }));
    };

    doAsync();
  }, [ethereum, data.selectedAddress, data.selectedAddressBalance]);

  return (
    <MetaMaskContext.Provider value={{ loading, data, ethereum }}>
      {children}
    </MetaMaskContext.Provider>
  );
};

export function useMetaMaskEthereum(): MetaMaskType {
  const mm = useContext(MetaMaskContext);
  if (!mm) {
    throw new Error(
      "`useMetaMaskEthereum()` Should have <MetaMaskProvider /> above it somewhere."
    );
  }
  return mm;
}
