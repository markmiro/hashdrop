// Colors from MetaMask
const chainIdToInfoMap = {
  "1": { name: "Mainnet", type: "prod", color: "#29b6af" },
  "3": { name: "Ropsten", type: "test", color: "#ff4a8d" },
  "42": { name: "Kovan", type: "test", color: "#9064ff" },
  "4": { name: "Rinkeby", type: "test", color: "#f6c343" },
  "5": { name: "Goerli", type: "test", color: "#3099f2" },
  "1337": { name: "localhost:8545", type: "test", color: "#d6d9dc" },
  "42161": {
    name: "Arbitrum",
    type: "prod",
    color: "#bbb",
  },
  "421611": {
    name: "Arbitrum Rinkeby",
    type: "test",
    color: "#bbb",
  },
  custom: { name: "Custom", type: "", color: "#bbb" },
};

type ChainId = keyof typeof chainIdToInfo;

export function chainIdToInfo(chainId: number) {
  if (
    Object.keys(chainIdToInfoMap)
      .map((id) => parseInt(id))
      .includes(chainId)
  ) {
    return chainIdToInfoMap[chainId as ChainId];
  }
  return chainIdToInfoMap.custom;
}
