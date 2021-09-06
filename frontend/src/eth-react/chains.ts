import { ethers } from "ethers";
import _ from "lodash";
import {
  chainIds,
  chainData,
  ChainId,
  ShowableChain,
  AddableChain,
  metaMaskDefaultChainIds,
} from "./chainData";

// https://vitalik.ca/general/2021/01/05/rollup.html
// Rollups move computation (and state storage) off-chain, but keep some data per transaction on-chain.
// Migrating to rollups is easy.
// Data on blockchain in stored in a merkle tree sort of like how Immutable.js works. It's a way to have immutable data structures that can change. Instead of copying the whole structure after each change, it just updates the parent nodes all the way up. This is also sort of how React rendering works.
// 2 kinds of rollups
// * Optimistic rollups keep track of all state changes in case someone submits a fraud proof. Then, transactions from that point on are reverted.
// * ZK Rollups are expensive because each batch update is verified
// Arbitrum and Optimism are basically the same. They both take a week to withdraw.

// https://www.reddit.com/r/maticnetwork/comments/nm2v1v/arbitrum_vs_polygon_thoughts/gzy8pk0?utm_source=share&utm_medium=web2x&context=3
// Rollups give about a 100x scale improvement.

// Make sure `chainIds` and `initialChains` both have the same keys
{
  const idsOfKeys = _.values(chainIds);
  const idsOfDetails = chainData.map((c) => c.chainId);
  const diffIds = _.difference(idsOfKeys, idsOfDetails);
  if (diffIds.length > 0) {
    throw new TypeError(
      `\`chainIds\` and \`initialChains\` should both have the same chains. Mismatch here: [${diffIds.toString()}]`
    );
  }
}

type RpcConnectChain = {
  chainName: string;
  chainId: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

export function toRpcConnect(c: AddableChain): RpcConnectChain {
  return {
    chainName: c.name,
    chainId: ethers.utils.hexValue(c.chainId),
    nativeCurrency: {
      name: c.nativeCurrency.name,
      symbol: c.nativeCurrency.symbol,
      decimals: c.nativeCurrency.decimals,
    },
    rpcUrls: c.rpc,
    blockExplorerUrls: c.explorers,
  };
}

const allChains = _.keyBy(chainData, "chainId");

const addableStructure = {
  chainId: _.isNumber,
  name: _.isString,
  nativeCurrency: (nc: any) =>
    _.conformsTo(nc, {
      name: _.isString,
      symbol: _.isString,
      decimals: _.isNumber,
    }),
  rpc: _.isArray,
  explorers: _.isArray,
};

const addableChains = chainData.filter((c) => {
  return (
    _.conformsTo<any>(c, addableStructure) &&
    !metaMaskDefaultChainIds.includes(c.chainId as any)
  );
});
const addableRpc = _.keyBy(addableChains, "chainId");

const idToKey = _.invert(chainIds);

const chains = {
  byId(id: ChainId) {
    return allChains[id];
  },
  showableById(id: number): ShowableChain {
    if (Object.values(chainIds).includes(id as any)) {
      return allChains[id];
    }
    return {
      name: `Unrecognized chain ID: ${id}`,
      chainId: id as any,
      testnet: false,
      color: "#bbb",
    };
  },
  addableById(id: number) {
    if (id in addableRpc) {
      return toRpcConnect(addableRpc[id] as AddableChain);
    }
  },
  idToKey(id: ChainId) {
    return idToKey[id as any];
  },
};

export { chainIds, chains };
