export function NonceErrorMessage({
  originalMessage,
}: {
  originalMessage: string;
}) {
  return (
    <div>
      <div className="block bg-red-100 p-2 text-center">
        <b>
          Transaction failed.{" "}
          <a href="https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet">
            Try resetting your wallet
          </a>
          .
        </b>
        <div>
          🦊 → (account icon on the top right) → Settings → Advanced → Reset
          Account. Then refresh the page.
        </div>
      </div>
      <div>Original error message: {originalMessage}</div>
    </div>
  );
}
