// TODO: put this functionality into an EthereumContext or something
export function reloadOnChainChanged() {
  // https://docs.metamask.io/guide/ethereum-provider.html#chainchanged
  if ("ethereum" in window && (window as any).ethereum) {
    (window as any).ethereum.on("chainChanged", () => window.location.reload());
  }
}
