import detectEthereumProvider from "@metamask/detect-provider";
import type { BaseProvider } from "@metamask/providers";
import delay from "delay";
import { ReactNode, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";

type Data = {
  isConnectedToCurrentChain: boolean;
  isMetaMask: boolean;
  chainId: string | undefined;
  selectedAddress: string | undefined;
  selectedAddressBalance: string | undefined;
  blockNumber: string | undefined;
  gasPrice: string | undefined;
};

export function useMetaMaskEthereum() {
  const handleError = useErrorHandler();
  const [uiError, setUiError] = useState<string | ReactNode>(""); // User-visible error
  const [ethereum, setEthereum] = useState<BaseProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data>({
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
    setUiError("");
    setLoading(true);
    const doAsync = async () => {
      try {
        const ethereum = (await detectEthereumProvider()) as BaseProvider;
        if (!ethereum) {
          setUiError(
            <span>
              Please{" "}
              <a
                className="link underline"
                style={{ color: "inherit" }}
                href="https://metamask.io/download"
              >
                Install MetaMask
              </a>
            </span>
          );
          setLoading(false);
          return;
        }
        if (ethereum !== window.ethereum) {
          setUiError("Do you have multiple wallets installed?");
          return;
        }
        setEthereum(ethereum);
        const chainId =
          (await ethereum.request<string>({
            method: "eth_chainId",
          })) ?? "";

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

        setData({
          // I've had this return false when I start a local hardhat node and
          // the frontend picks up the connection, but MetaMask continues to hang
          // until I disconnect from the localhost chain and connect back.
          isConnectedToCurrentChain: ethereum.isConnected(),
          isMetaMask: (ethereum as any).isMetaMask,
          chainId,
          selectedAddress,
          selectedAddressBalance: undefined,
          blockNumber: blockNumber ?? undefined,
          gasPrice: gasPrice ?? undefined,
        });

        ethereum.on("accountsChanged", (accounts: [string]) => {
          try {
            setData((d: Data) => ({
              ...d,
              selectedAddress: accounts[0],
            }));
          } catch (err) {
            handleError(err);
          }
        });

        await delay(500);
        setLoading(false);
      } catch (err) {
        handleError(err);
      }
    };
    doAsync();
  }, [handleError]);

  useEffect(() => {
    if (!ethereum) return;
    if (!data?.selectedAddress) return;

    const doAsync = async () => {
      const selectedAddressBalance =
        (data.selectedAddress &&
          (await ethereum.request<string>({
            method: "eth_getBalance",
            params: [data.selectedAddress, "latest"],
          }))) ??
        undefined;
      setData((d: Data) => ({
        ...d,
        selectedAddressBalance: selectedAddressBalance,
      }));
    };

    doAsync();
  }, [ethereum, data]);

  return { loading, uiError, data, ethereum };
}
