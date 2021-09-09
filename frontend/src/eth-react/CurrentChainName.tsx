import { chains } from "./chains";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

export function CurrentChainName() {
  const { data } = useMetaMaskEthereum();
  const chain = chains.showableById(data.chainId || -1);

  return <>{chain.prettyName || chain.name}</>;
}
