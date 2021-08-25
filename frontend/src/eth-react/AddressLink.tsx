import { FC, useEffect, useState } from "react";
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

export const AddressLink: FC<{ address?: string }> = ({
  address,
  children,
}) => {
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

  if (!address) return <>No address</>;

  if (network === "unknown") {
    return <div className="f7 gray truncate">{address}</div>;
  }

  const subdomain = network === "mainnet" ? "www" : network;

  return (
    <a
      href={`https://${subdomain}.etherscan.io/address/${address}`}
      className={`f7 db dark-blue truncate code ttl ${disabled ? "o-60 " : ""}`}
      style={disabled ? { pointerEvents: "none" } : {}}
      target="_blank"
      rel="noreferrer"
    >
      {children || address}
      <span className="sans-serif">↗</span>
    </a>
  );
};
