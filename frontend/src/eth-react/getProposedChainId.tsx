export function getProposedChainId() {
  // https://docs.metamask.io/guide/rpc-api.html#wallet-switchethereumchain
  // "0x"+(1337).toString(16) === "0x539"
  let proposedChainId = "0x1"; // Mainnet
  if (process.env.NODE_ENV === "development") {
    proposedChainId = "0x539"; // 1337 - localhost
  } else if (process.env.NODE_ENV === "test") {
    proposedChainId = "0x3"; // Ropsten
  }

  return proposedChainId;
}
