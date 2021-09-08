import { BaseProvider } from "@metamask/providers";

// Note: this returns false if the connection can't be made.
// However, if the connection is made, then broken, then even refreshing the page won't fix this.
// This is because MetaMask seems to cache information about the connection and can't tell if the
// connection was dropped.
export function testConnection(ethereum: BaseProvider): Promise<boolean> {
  return new Promise((resolve) => {
    let didTimeout = false;

    const timeoutId = setTimeout(() => {
      didTimeout = true;
      console.log("resolve(false)");
      resolve(false);
    }, 3000);

    ethereum
      .request<string>({
        method: "eth_blockNumber",
        params: [],
      })
      .then((chainId) => {
        // NOTE: not using the response
        if (didTimeout) return;
        clearTimeout(timeoutId);
        console.log("resolve(true)", chainId);
        resolve(true);
      })
      .catch((err) => {
        if (didTimeout) return;
        console.log("resolve(false)");
        resolve(false);
        throw err;
      });
  });
}
