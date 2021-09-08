import hre from "hardhat";
import got from "got";
import path from "path";
import jsonfile from "jsonfile";

const FILENAME = "chains.json";

const FILE_OPTIONS = {
  encoding: "utf-8",
};

type Chain = {
  name: string;
  chainId: number;
  networkId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: string[];
  faucets: string[];
  infoURL: string;
};

async function main() {
  // Fetch

  const chains = (await got
    .get("https://chainid.network/chains.json")
    .json()) as Chain[];

  // Index by id

  let chainsById: Record<string, Chain> = {};
  chains.map((chain) => (chainsById[chain.chainId.toString()] = chain));

  // Write file

  const filePath = hre.config.frontendArtifacts.path;
  const filePath2 = path.join(filePath, FILENAME);
  jsonfile.writeFileSync(filePath2, chainsById, {
    ...FILE_OPTIONS,
    spaces: 2,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
