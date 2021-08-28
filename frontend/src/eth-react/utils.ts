import { BigNumber, ethers } from "ethers";

export function prettyBlockNumber(hex?: string) {
  if (!hex) return "-";
  return BigNumber.from(hex).toNumber();
}

export function prettyGasPrice(hex?: string) {
  if (!hex) return "-";
  return parseFloat(
    ethers.utils.formatUnits(BigNumber.from(hex), "gwei")
  ).toFixed(2);
}

export function prettyAccountBalance(hex?: string) {
  if (!hex) return "-";
  return parseFloat(
    ethers.utils.formatUnits(BigNumber.from(hex), "ether")
  ).toFixed(4);
}
