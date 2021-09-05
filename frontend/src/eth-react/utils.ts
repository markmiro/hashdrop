import { BigNumber, utils } from "ethers";

export const truncateEthAddress = (addr?: string) => {
  if (!addr) addr = "0x00000000000000000000";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
};

export function prettyBlockNumber(hex?: string) {
  if (!hex) return "-";
  return BigNumber.from(hex).toNumber();
}

export function prettyGasPrice(hex?: string) {
  if (!hex) return "-";
  return parseFloat(utils.formatUnits(BigNumber.from(hex), "gwei")).toFixed(2);
}

export function prettyAccountBalance(hex?: string) {
  if (!hex) return "-";
  return parseFloat(utils.formatUnits(BigNumber.from(hex), "ether")).toFixed(4);
}
