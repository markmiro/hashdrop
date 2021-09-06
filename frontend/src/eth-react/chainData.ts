import { chains, ChainId as EthChainId } from "eth-chains";
// Sources:
// https://chainlist.org
// https://support.mycrypto.com/how-to/getting-started/where-to-get-testnet-ether
// https://arbitrum.io/bridge-tutorial
// EIP-3085

export const chainIds = {
  LOCALHOST: 1337,
  MAINNET: EthChainId.EthereumMainnet,
  ROPSTEN: EthChainId.EthereumTestnetRopsten,
  KOVAN: EthChainId.EthereumTestnetKovan,
  RINKEBY: EthChainId.EthereumTestnetRinkeby,
  GOERLI: EthChainId.EthereumTestnetGörli,
  ARBITRUM: 42161,
  ARBITRUM_RINKEBY: EthChainId.ArbitrumTestnetRinkeby,
  OPTIMISM: EthChainId.OptimisticEthereum,
  OPTIMISM_KOVAN: EthChainId.OptimisticEthereumTestnetKovan,
  POLYGON: EthChainId.MaticMainnet,
  POLYGON_MUMBAI: EthChainId.MaticTestnetMumbai,
} as const;

export const metaMaskDefaultChainIds = [
  chainIds.MAINNET,
  chainIds.ROPSTEN,
  chainIds.KOVAN,
  chainIds.RINKEBY,
  chainIds.GOERLI,
] as const;

export const chainData: Chain[] = [
  {
    chainId: chainIds.LOCALHOST,
    name: "localhost:8545",
    testnet: true,
    color: "#d6d9dc",
  },
  {
    chainId: chainIds.MAINNET,
    name: "Mainnet",
    testnet: false,
    color: "#29b6af",
    explorers: ["https://etherscan.io"],
  },
  {
    chainId: chainIds.ROPSTEN,
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
    chainId: chainIds.RINKEBY,
    name: "Rinkeby",
    testnet: true,
    color: "#f6c343",
    explorers: ["https://rinkeby.etherscan.io"],
    faucets: ["https://faucet.rinkeby.io/"],
  },
  {
    chainId: chainIds.GOERLI,
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
    chainId: chainIds.KOVAN,
    name: "Kovan",
    testnet: true,
    color: "#9064ff",
    explorers: ["https://kovan.etherscan.io"],
    faucets: [
      "https://linkfaucet.protofire.io/kovan",
      "https://faucet.daostack.io",
      "https://faucet.buni.finance",
      "https://gitter.im/kovan-testnet/faucet",
      "https://github.com/kovan-testnet/faucet",
      "https://faucet.kovan.network",
      "https://ethdrop.dev",
      "https://xdefilab.medium.com/how-to-get-kovan-testnet-tokens-b5cf21967a8c",
    ],
  },
  {
    chainId: chainIds.ARBITRUM,
    name: "Arbitrum One",
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
    chainId: chainIds.ARBITRUM_RINKEBY,
    name: chains.getById(EthChainId.ArbitrumTestnetRinkeby)?.name as any,
    testnet: true,
    color: "#28a0f0",
    nativeCurrency: chains.getById(EthChainId.ArbitrumTestnetRinkeby)
      ?.nativeCurrency,
    rpc: chains.getById(EthChainId.ArbitrumTestnetRinkeby)?.rpc,
    explorers: ["https://rinkeby-explorer.arbitrum.io"],
    faucets: ["https://bridge.arbitrum.io"],
    notes:
      "The faucet is really a bridge. First use an Ethereum Rinkeby faucet to get some eth, then use the Arbitrum bridge and send some of the eth to Arbitrum's Rinkeby testnet.",
  },
  {
    chainId: chainIds.OPTIMISM,
    name: chains.getById(EthChainId.OptimisticEthereum)?.name as any,
    testnet: false,
    color: "#ff0320",
    nativeCurrency: chains.getById(EthChainId.OptimisticEthereum)
      ?.nativeCurrency,
    rpc: chains.getById(EthChainId.OptimisticEthereum)?.rpc,
    // Old: https://explorer.optimism.io
    explorers: ["https://optimistic.etherscan.io"],
  },
  {
    chainId: chainIds.OPTIMISM_KOVAN,
    name: chains.getById(EthChainId.OptimisticEthereumTestnetKovan)
      ?.name as any,
    infoUrl: "https://optimism.io",
    testnet: true,
    color: "#ff0320",
    nativeCurrency: chains.getById(EthChainId.OptimisticEthereumTestnetKovan)
      ?.nativeCurrency,
    rpc: chains.getById(EthChainId.OptimisticEthereumTestnetKovan)?.rpc,
    // From https://gateway.optimism.io/
    explorers: ["https://kovan-explorer.optimism.io"],
    // Not a real faucet
    faucets: [
      "https://gateway.optimism.io",
      "https://cryptomarketpool.com/optimistic-ethereum-layer-2",
    ],
    notes:
      "The faucet link is actually a bridge. First get some ETH into Kovan via a faucet, then use the bridge to send it to the Optimism network.",
  },
  {
    chainId: chainIds.POLYGON,
    name: "Matic(Polygon) Mainnet",
    testnet: false,
    color: "#8247e5",
    nativeCurrency: chains.getById(chainIds.POLYGON)?.nativeCurrency,
    rpc: chains.getById(chainIds.POLYGON)?.rpc,
    explorers: ["https://polygonscan.com"],
    notes: "Sidechain, and has it's own coin.",
    infoUrl: "https://matic.network",
    faucets: ["https://faucet.matic.network"],
  },
  {
    chainId: chainIds.POLYGON_MUMBAI,
    name: "Matic(Polygon) Testnet Mumbai",
    testnet: true,
    color: "#8247e5",
    nativeCurrency: chains.getById(EthChainId.MaticTestnetMumbai)
      ?.nativeCurrency,
    rpc: chains.getById(EthChainId.MaticTestnetMumbai)?.rpc,
    explorers: ["https://mumbai.polygonscan.com/"],
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

export type AddableChain = {
  chainId: ChainId;
  name: string;
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
  faucets?: string[];
};

export type Chain =
  | ShowableChain
  | (ShowableChain & AddableChain)
  | (ShowableChain & TestnetChain)
  | (ShowableChain & TestnetChain & AddableChain);
