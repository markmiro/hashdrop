import { chains } from "./chains";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

export function CurrentChainName() {
  const { data } = useMetaMaskEthereum();

  const name = chains.showableById(data.chainId || -1).name;

  return <>{name}</>;
}
