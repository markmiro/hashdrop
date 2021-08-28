// Colors from MetaMask
export const chainIdToInfoMap = {
  "0x1": { name: "Mainnet", type: "prod", color: "#29b6af" },
  "0x3": { name: "Ropsten", type: "test", color: "#ff4a8d" },
  "0x2a": { name: "Kovan", type: "test", color: "#9064ff" },
  "0x4": { name: "Rinkeby", type: "test", color: "#f6c343" },
  "0x5": { name: "Goerli", type: "test", color: "#3099f2" },
  "0x539": { name: "localhost:8545", type: "test", color: "#d6d9dc" },
  custom: { name: "Custom", type: "", color: "#29b6af" },
};

type ChainId = keyof typeof chainIdToInfo;

export function chainIdToInfo(chainId: string) {
  if (Object.keys(chainIdToInfoMap).includes(chainId)) {
    return chainIdToInfoMap[chainId as ChainId];
  }
  return chainIdToInfoMap.custom;
}