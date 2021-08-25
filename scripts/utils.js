require("dotenv").config();
const { ethers } = require("hardhat");

/**
 * Balance with truncated decimal places
 * @param {BigNumber} balance
 * @returns {string}
 */
function prettyBalance(balance) {
  return parseFloat(ethers.utils.formatEther(balance)) + " eth";
}

async function logBalanceDifference(cb) {
  const [deployer] = await ethers.getSigners();

  const startingBalance = await deployer.getBalance();
  await cb();
  const endingBalance = await deployer.getBalance();
  const balance = startingBalance.sub(endingBalance);
  console.log("Deploy cost:", prettyBalance(balance));
  return balance;
}

module.exports = {
  logBalanceDifference,
};
