// TODO: Unused, but would be nice to catch this error and display a UI or something telling user (likely a developer) what to do.
export function rewriteNonceError(err: any) {
  if (process.env.NODE_ENV === "development") {
    if (err instanceof Error && err.message.includes("Nonce too high")) {
      throw new Error(
        `Transaction failed. Try resetting your wallet: https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet. Original error message: ${err.message}`
      );
    }
  }
}
