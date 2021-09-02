import { FC, useEffect, useState } from "react";
import { CopyButton } from "../generic/CopyButton";
import { useEthersProvider } from "./EthersProviderContext";

const availableNetworks = [
  "mainnet",
  "ropsten",
  "kovan",
  "rinkeby",
  "goerli",
] as const;

type EtherscanNetwork = typeof availableNetworks[number];

type NetworkOrState =
  | "loading"
  | "unknown" // likely localhost
  | EtherscanNetwork;

export const AddressLink: FC<{ address?: string }> = ({ address }) => {
  const provider = useEthersProvider();
  const [network, setNetwork] = useState<NetworkOrState>("loading");

  useEffect(() => {
    if (provider.network.name === "unknown") {
      setNetwork("unknown");
    } else if (provider.network.chainId === 1) {
      setNetwork("mainnet");
    } else if (
      (availableNetworks as readonly string[]).includes(provider.network.name)
    ) {
      setNetwork(provider.network.name as EtherscanNetwork);
    } else {
      setNetwork("unknown");
    }
  }, [provider.network.name, provider.network.chainId]);

  const disabled = network === "loading";

  // if (!address) return <div className="font-mono lowercase">No address</div>;
  if (!address) address = "0xxxxxxxx";

  // Truncate so it's easier to compare
  const clampedAddress = address.slice(0, 6) + "..." + address.slice(-4);

  if (network === "unknown") {
    return (
      <div className="opacity-60 font-mono lowercase">
        {clampedAddress}{" "}
        <CopyButton className="ml-2 btn-light text-sm" toCopy={address} />
      </div>
    );
  }

  const subdomain = network === "mainnet" ? "www" : network;

  return (
    <div>
      <a
        href={`https://${subdomain}.etherscan.io/address/${address}`}
        className={`inline-block font-mono lowercase no-underline ${
          disabled && "opacity-60 pointer-events-auto"
        }`}
        target="_blank"
        rel="noreferrer"
      >
        {clampedAddress}
        <span className="font-sans opacity-40 text-sm">↗</span>
      </a>
      <CopyButton className="ml-2 btn-light text-sm" toCopy={address} />
    </div>
  );
};
