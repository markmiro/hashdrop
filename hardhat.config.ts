// import "./frontendArtifacts.d.ts";
import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

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

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY =
  "51e789f13101edb0cd1d665a7dd7b178a917ce4b52993138dac8eef4ff39b9a2";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
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
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
    },
    mainnet: {
      // From: https://dashboard.alchemyapi.io/apps/8z6bnqu7e5bnckr3 -> VIEW KEY
      url: `https://eth-mainnet.alchemyapi.io/v2/mKZMh3c3jyQRxZ0FM0c2Td9WwvFNYd3Z`,
      accounts: [`0x${process.env.MAINNET_PRIVATE_KEY}`],
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
