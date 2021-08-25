const hre = require("hardhat");
const path = require("path");
const jsonfile = require("jsonfile");
const deepMerge = require("deepmerge");

const FILENAME = "hardhat-frontend-artifacts.json";

const FILE_OPTIONS = {
  encoding: "utf-8",
};

const INITIAL_JSON = {
  NOTE: "Auto-generated. Don't edit",
  contract: {},
};

/**
 * For use in frontend where you don't need the binary representation.
 * AFAICT, you use the address, chainId, and maybe the name of the contract.
 * Debug info is also saved to help you track down problems with deployments.
 *
 */
class FrontendArtifacts {
  constructor() {
    if (!hre.config.frontendArtifacts || !hre.config.frontendArtifacts.path) {
      throw new Error(
        `
        FrontendArtifacts plugin requires a destination for the artifacts. This should be the \`src\`
        directory if you're putting it in a React app or similar framework.

        // hardhat.config.js
        module.exports = {
          // ...
          frontendArtifacts: {
            path: "./frontend/src",
          }
          // ...
        }
        `
      );
    }
    const filePath = hre.config.frontendArtifacts.path;
    this.filePath = path.join(filePath, FILENAME);
    try {
      this.json = jsonfile.readFileSync(this.filePath, FILE_OPTIONS);
    } catch (err) {
      return;
    }
    // if (!this.json) {
    //   throw new Error(
    //     `Couldn't read ${this.filePath}. Make sure the file exists and is ${FILE_OPTIONS.encoding} encoded.`
    //   );
    // }
    this.json = deepMerge(INITIAL_JSON, this.json);
    // console.log("loaded file:", this.json);
  }

  /**
   * Call this function to save deployment to frontend file like so:
   * ```
   * const ContractFactory = await ethers.getContractFactory("MyContract");
   * const contract = await ContractFactory.deploy();
   * feArtifacts.addContract("MyContract", contract.address);
   * ```
   * @param {string} contractName
   * @param {string} address
   */
  async addContract(contractName, address) {
    // console.log("Adding", contractName, "contract to", FILENAME);
    const network = await hre.ethers.provider.getNetwork();
    const contract = await hre.artifacts.readArtifact(contractName);

    // Add new address and possibly other stuff to existing contract deploy
    this.json = deepMerge(this.json, {
      contract: {
        [contractName]: {
          name: contractName,
          chainId: {
            [network.chainId]: { address: address },
          },
        },
      },
    });

    // Add ABI
    this.json.contract[contractName].abi = contract.abi;

    // Add debug info
    this.json.contract[contractName]._debug = {
      lastDeploy: {
        ts: Date.now(),
        str: new Date().toUTCString(),
        networkName: network.name,
      },
      sourceName: (await hre.artifacts.readArtifact(contractName)).sourceName,
    };
  }

  /**
   * Save file once all deployments are done
   */
  save() {
    // NOTE: Consider checking deployment success and only writing after deploy is successful.
    // Would need to log that deploy is in progress and another message if it seems to be taking a while.
    // This is because host reload will pick up the new file and will fail to connect to contract if it hasn't finished deploying yet.
    // However, in prod we don't want to hold up the build. So probably best to leave the checking to the frontend.
    jsonfile.writeFileSync(this.filePath, this.json, {
      ...FILE_OPTIONS,
      spaces: 2,
    });
  }
}

async function createFrontendArtifacts(cb) {
  const fe = new FrontendArtifacts();
  await cb(fe.addContract.bind(fe));
  fe.save();
}

// Exports
exports.FrontendArtifacts = FrontendArtifacts;
exports.createFrontendArtifacts = createFrontendArtifacts;
