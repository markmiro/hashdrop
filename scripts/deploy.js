const { ethers } = require("hardhat");
const { createFrontendArtifacts } = require("./plugins/FrontendArtifacts");
const { logBalanceDifference } = require("./utils");

async function deploy(addContract) {
  console.log("---");
  console.log("HashDrop");
  await logBalanceDifference(async () => {
    const HashDrop = await ethers.getContractFactory("HashDrop");
    const hashDrop = await HashDrop.deploy();
    console.log("Deployed to:", hashDrop.address);
    await addContract("HashDrop", hashDrop.address);
  });
}

async function main() {
  // Wrap deploy() with a helper
  await createFrontendArtifacts(async (addContract) => {
    await deploy(addContract);
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
