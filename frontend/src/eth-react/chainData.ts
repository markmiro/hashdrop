// Sources:
// https://chainlist.org
// https://support.mycrypto.com/how-to/getting-started/where-to-get-testnet-ether
// https://arbitrum.io/bridge-tutorial
// EIP-3085

export const chainIds = {
  LOCALHOST: 1337,
  MAINNET: 1,
  ROPSTEN: 3,
  KOVAN: 42,
  RINKEBY: 4,
  GOERLI: 5,
  ARBITRUM: 42161,
  ARBITRUM_RINKEBY: 421611,
  OPTIMISM: 10,
  OPTIMISM_KOVAN: 69,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
} as const;

export const chainData: Chain[] = [
  {
    chainId: 1337,
    shortName: "localhost",
    name: "localhost:8545",
    testnet: true,
    color: "#d6d9dc",
  },
  {
    chainId: 1,
    shortName: "mainnet",
    name: "Mainnet",
    testnet: false,
    color: "#29b6af",
    explorers: ["https://etherscan.io"],
  },
  {
    chainId: 3,
    shortName: "ropsten",
    name: "Ropsten",
    testnet: true,
    color: "#ff4a8d",
    notes: "Matches production environment. Not immune to spam attacks.",
    faucets: [
      // https://docs.alchemy.com/alchemy/guides/choosing-a-network#ropsten
      "https://faucet.metamask.io",
      "http://faucet.ropsten.be:3001",
      "https://faucet.bitfwd.xyz",
    ],
    explorers: ["https://ropsten.etherscan.io"],
  },
  {
    chainId: 4,
    shortName: "rinkeby",
    name: "Rinkeby",
    testnet: true,
    color: "#f6c343",
    explorers: ["https://rinkeby.etherscan.io"],
    faucets: ["https://faucet.rinkeby.io/"],
  },
  {
    chainId: 5,
    shortName: "goerli",
    name: "Goerli",
    testnet: true,
    color: "#3099f2",
    explorers: ["https://goerli.etherscan.io"],
    // https://docs.alchemy.com/alchemy/guides/choosing-a-network#goerli
    notes:
      "Consistent availability, high reliability. Supported by multiple clients.",
    faucets: [
      "https://goerli-faucet.dappnode.net",
      "https://faucet.goerli.mudit.blog",
      "https://goerli-faucet.slock.it",
    ],
  },
  {
    chainId: 42,
    shortName: "kovan",
    name: "Kovan",
    testnet: true,
    color: "#9064ff",
    explorers: ["https://kovan.etherscan.io"],
    faucets: [
      "https://gitter.im/kovan-testnet/faucet",
      "https://github.com/kovan-testnet/faucet",
      "https://faucet.kovan.network",
      "https://ethdrop.dev",
      "https://xdefilab.medium.com/how-to-get-kovan-testnet-tokens-b5cf21967a8c",
    ],
  },
  {
    chainId: 42161,
    shortName: "arbitrum",
    name: "Arbitrum",
    testnet: false,
    color: "#28a0f0",
    nativeCurrency: {
      name: "Arbitrum Ether",
      symbol: "AETH",
      decimals: 18,
    },
    rpc: ["https://arb1.arbitrum.io/rpc"],
    explorers: ["https://arbiscan.io"],
  },
  {
    chainId: 421611,
    shortName: "arbitrum-rinkeby",
    name: "Arbitrum Rinkeby",
    testnet: true,
    color: "#28a0f0",
    nativeCurrency: {
      name: "Arbitrum Rinkeby Ether",
      symbol: "ARETH",
      decimals: 18,
    },
    rpc: ["https://rinkeby.arbitrum.io/rpc", "wss://rinkeby.arbitrum.io/ws"],
    explorers: ["https://rinkeby-explorer.arbitrum.io"],
    faucets: ["https://bridge.arbitrum.io"],
    notes:
      "The faucet is really a bridge. First use an Ethereum Rinkeby faucet to get some eth, then use the Arbitrum bridge and send some of the eth to Arbitrum's Rinkeby testnet.",
  },
  {
    chainId: 10,
    shortName: "optimism",
    name: "Optimistic Ethereum",
    testnet: false,
    color: "#ff0320",
    nativeCurrency: {
      name: "Ether",
      symbol: "OETH",
      decimals: 18,
    },
    rpc: ["https://mainnet.optimism.io"],
    // Old: https://explorer.optimism.io
    explorers: ["https://optimistic.etherscan.io"],
  },
  {
    chainId: 69,
    shortName: "optimism-kovan",
    name: "Optimistic Kovan",
    infoUrl: "https://optimism.io",
    testnet: true,
    color: "#ff0320",
    nativeCurrency: {
      name: "Kovan Ether",
      symbol: "KOR",
      decimals: 18,
    },
    rpc: ["https://kovan.optimism.io"],
    // From https://gateway.optimism.io/
    explorers: ["https://kovan-explorer.optimism.io"],
    // Not a real faucet
    faucets: ["https://gateway.optimism.io"],
    notes:
      "The faucet link is actually a bridge. First get some ETH into Kovan via a faucet, then use the bridge to send it to the Optimism network.",
  },
  {
    chainId: 137,
    shortName: "polygon",
    name: "Matic/Polygon Mainnet",
    testnet: false,
    color: "#8247e5",
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
    rpc: [
      "https://rpc-mainnet.matic.network",
      "wss://ws-mainnet.matic.network",
    ],
    explorers: ["https://polygonscan.com"],
    notes: "Sidechain, and has it's own coin.",
    infoUrl: "https://matic.network",
    faucets: ["https://faucet.matic.network"],
  },
  {
    chainId: 80001,
    shortName: "polygon-mumbai",
    name: "Matic/Polygon Mumbai",
    testnet: true,
    color: "#8247e5",
    nativeCurrency: {
      name: "Matic",
      symbol: "tMATIC",
      decimals: 18,
    },
    rpc: ["https://rpc-mumbai.matic.today", "wss://ws-mumbai.matic.today"],
    explorers: ["https://mumbai.polygonscan.com"],
    infoUrl: "https://matic.network",
    faucets: ["https://faucet.matic.network"],
  },
];

// ------------------------------------------------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------------------------------------------------

type ChainKeys = keyof typeof chainIds;
export type ChainId = typeof chainIds[ChainKeys];

export type ShowableChain = {
  chainId: ChainId;
  shortName?: string;
  name: string;
  testnet: boolean;
  color: string;
  infoUrl?: string;
  notes?: string;
};

export type ShowableAndAddableChain = ShowableChain & AddableChain;

export type AddableChain = {
  // name: string;
  // chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: string[];
  explorers: string[];
};

export type TestnetChain = {
  testnet: true;
  faucets: string[];
};

export type Chain =
  | ShowableChain
  | ShowableAndAddableChain
  | (ShowableAndAddableChain & TestnetChain);
