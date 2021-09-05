import { FC, useEffect, useState } from "react";
import { CopyButton } from "../generic/CopyButton";
import { Anchor } from "../generic/Anchor";
import { MonoText } from "../generic/MonoText";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";
import { chains } from "./chains";
import { truncateEthAddress } from "./utils";

export const AddressLink: FC<{ address?: string }> = ({ address }) => {
  const { data } = useMetaMaskEthereum();
  const [explorer, setExplorer] = useState<string | null>();

  useEffect(() => {
    const chainId = data.chainId;
    const chain = chains.byId(chainId as any);
    if ("explorers" in chain && chain.explorers.length > 0) {
      setExplorer(chain.explorers[0]);
    } else {
      setExplorer(null);
    }
  }, [data.chainId]);

  if (!address) {
    return <MonoText isDisabled>{truncateEthAddress(address)}</MonoText>;
  }

  if (!explorer) {
    return (
      <span>
        <MonoText isDisabled>{truncateEthAddress(address)}</MonoText>
        <CopyButton ml="2" toCopy={address} />
      </span>
    );
  }

  return (
    <span>
      <Anchor to={`${explorer}/address/${address}`} isExternal>
        <MonoText textTransform="lowercase">
          {truncateEthAddress(address)}
        </MonoText>
      </Anchor>
      <CopyButton ml="2" toCopy={address} />
    </span>
  );
};
