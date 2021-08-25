import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import type { BaseProvider } from "@metamask/providers";
import delay from "delay";
import { ReactNode, useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";

export function useMetaMaskEthereum() {
  const handleError = useErrorHandler();
  const [uiError, setUiError] = useState<string | ReactNode>(""); // User-visible error
  const [ethereum, setEthereum] = useState<BaseProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

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
        const chainId = await ethereum.request({ method: "eth_chainId" });

        const blockNumber = parseInt(
          (await ethereum.request({
            method: "eth_blockNumber",
            params: [],
          })) as string,
          16
        );

        const gasPrice = parseFloat(
          ethers.utils.formatUnits(
            (await ethereum.request({
              method: "eth_gasPrice",
              params: [],
            })) as string,
            "gwei"
          )
        ).toFixed(2);

        const addresses = (await ethereum.request({
          method: "eth_accounts",
        })) as [string];
        const selectedAddress = addresses.length ? addresses[0] : null;

        setData({
          // I've had this return false when I start a local hardhat node and
          // the frontend picks up the connection, but MetaMask continues to hang
          // until I disconnect from the localhost chain and connect back.
          isConnectedToCurrentChain: ethereum.isConnected(),
          isMetaMask: (ethereum as any).isMetaMask,
          chainId,
          selectedAddress,
          blockNumber,
          gasPrice,
        });

        ethereum.on("accountsChanged", (accounts: [string]) => {
          try {
            setData((d: any) => ({
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
      const selectedAddressBalance = data.selectedAddress
        ? ((await ethereum.request({
            method: "eth_getBalance",
            params: [data.selectedAddress, "latest"],
          })) as string)
        : 0;
      setData((d: any) => ({
        ...d,
        selectedAddressBalance: parseFloat(
          ethers.utils.formatUnits(
            ethers.BigNumber.from(selectedAddressBalance),
            "ether"
          )
        ).toFixed(4),
      }));
    };

    doAsync();
  }, [ethereum, data]);

  return { loading, uiError, data, ethereum };
}
