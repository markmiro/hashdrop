import { FC, useEffect, useState } from "react";
import { CopyButton } from "../generic/CopyButton";
import { useEthersProvider } from "./EthersProviderContext";
import { Anchor } from "../generic/Anchor";
import { MonoText } from "../generic/MonoText";

const availableNetworks = [
  "mainnet",
  "ropsten",
  "kovan",
  "rinkeby",
  "goerli",
] as const;

type EtherscanNetwork = typeof availableNetworks[number];

const truncate = (str: string) => str.slice(0, 6) + "..." + str.slice(-4);

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

  if (!address) {
    return <MonoText isDisabled>{truncate("0x00000000000000000000")}</MonoText>;
  }

  if (network === "unknown") {
    return (
      <span>
        <MonoText isDisabled>{truncate(address)}</MonoText>
        <CopyButton ml="2" toCopy={address} />
      </span>
    );
  }

  const subdomain = network === "mainnet" ? "www" : network;

  return (
    <span>
      <Anchor
        to={`https://${subdomain}.etherscan.io/address/${address}`}
        isExternal
        isDisabled={disabled}
      >
        <MonoText textTransform="lowercase">{truncate(address)}</MonoText>
      </Anchor>
      <CopyButton ml="2" toCopy={address} />
    </span>
  );
};
