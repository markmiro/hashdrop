// import "./frontendArtifacts.d.ts";
import "@eth-optimism/hardhat-ovm";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import dotenv from "dotenv";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

type FrontendArtifacts = {
  path: string;
};

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    frontendArtifacts?: FrontendArtifacts;
  }
  interface HardhatConfig {
    frontendArtifacts: FrontendArtifacts;
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.7.6",
  // This is used by the ./plugins/FrontendArtifacts.js plugin
  frontendArtifacts: {
    path: "./frontend/src",
  },
  // https://hardhat.org/hardhat-network/
  networks: {
    hardhat: {
      // https://hardhat.org/metamask-issue.html
      chainId: 1337,
    },
    ropsten: {
      // From: https://dashboard.alchemyapi.io/apps/ynblct7gs7t8bilb -> VIEW KEY
      url: `https://eth-ropsten.alchemyapi.io/v2/3RI0h7l9dI7NPpIWBKiASq6IV0cUFbRQ`,
      accounts: [`0x${process.env.TEST_ACCOUNT_PRIVATE_KEY}`],
    },
    mainnet: {
      // From: https://dashboard.alchemyapi.io/apps/8z6bnqu7e5bnckr3 -> VIEW KEY
      url: `https://eth-mainnet.alchemyapi.io/v2/mKZMh3c3jyQRxZ0FM0c2Td9WwvFNYd3Z`,
      accounts: [`0x${process.env.MAINNET_PRIVATE_KEY}`],
    },
    // https://developer.offchainlabs.com/docs/contract_deployment#hardhat
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/TycfEw932RND0MaiwwBB6AADeCH1tQ4u`,
      accounts: [`0x${process.env.MAINNET_PRIVATE_KEY}`],
    },
    arbtest: {
      url: `https://arb-rinkeby.g.alchemy.com/v2/TycfEw932RND0MaiwwBB6AADeCH1tQ4u`,
      accounts: [
        `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`,
      ],
      gasPrice: 0,
    },
    // https://docs.matic.network/docs/develop/hardhat/
    matictest: {
      // url: "https://rpc-mumbai.maticvigil.com",
      url: "https://polygon-mumbai.g.alchemy.com/v2/-_gIxO0TWmjnOuGM99vTELeIcUk-hIRn",
      // url: "https://polygon-mumbai.infura.io/v3/0487cf5b75ee421d97dac67f738a0681",
      accounts: [`0x${process.env.TEST_ACCOUNT_PRIVATE_KEY}`],
    },
    // https://github.com/ethereum-optimism/optimism-tutorial/tree/main/hardhat
    optitest: {
      url: "https://kovan.optimism.io",
      gasPrice: 15000000,
      accounts: [`0x${process.env.TEST_ACCOUNT_PRIVATE_KEY}`],
      ovm: true,
    },
  },
  // https://hardhat.org/plugins/hardhat-gas-reporter.html#configuration
  gasReporter: {
    currency: "USD",
    coinmarketcap: "5dd3885c-6fb5-4475-a3e6-acdd7d164c79",
  },
  // https://github.com/ethereum-ts/TypeChain/tree/master/packages/hardhat#configuration
  typechain: {
    outDir: "frontend/src/typechain",
    target: "ethers-v5",
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: ["externalArtifacts/*.json"], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
};

export default config;
