import { Link, LinkProps } from "@chakra-ui/react";
import { FC } from "react";
import { chains } from "./chains";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

export const BlockExplorerLink: FC<LinkProps & { address: string }> = ({
  address,
  children,
  ...rest
}) => {
  const { data } = useMetaMaskEthereum();

  const chainId = data.chainId;
  const chain = chains.byId(chainId as any);
  let explorer = null;
  if ("explorers" in chain && chain.explorers && chain.explorers.length > 0) {
    explorer = chain.explorers[0];
  }

  const disabledProps: LinkProps = explorer
    ? {}
    : {
        pointerEvents: "none",
        opacity: 0.5,
      };

  return (
    <Link
      isExternal
      href={`${explorer}/address/${address}`}
      {...rest}
      {...disabledProps}
    >
      {children}
    </Link>
  );
};
