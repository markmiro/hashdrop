import { ethers } from "ethers";

const CONNECTION_TIMEOUT = 5000;
/*
Try to get block number to test if a connection can be made.
If it time's out then throw an error.
*/
export function testProvider(provider: ethers.providers.Web3Provider) {
  return new Promise<boolean>((resolve, reject) => {
    let blockNumber: number | null = null;

    const connectionError = () => {
      const err = Error(
        "Provider can't connect to network. Please check your MetaMask wallet."
      );
      reject(err);
    };

    provider
      .getBlockNumber()
      .then((block) => {
        blockNumber = block;
        resolve(true);
      })
      .catch(connectionError);

    setTimeout(() => {
      if (!blockNumber) {
        connectionError();
      }
    }, CONNECTION_TIMEOUT);
  });
}
