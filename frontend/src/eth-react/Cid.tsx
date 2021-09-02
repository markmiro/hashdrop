import React from "react";
import { CopyButton } from "../generic/CopyButton";

export function Cid({ cid }: { cid?: string }) {
  if (!cid)
    return <div className="flex items-start font-mono opacity-60">N/A</div>;

  const clampedCid = cid.slice(0, 6) + "..." + cid.slice(-4);

  return (
    // https://cid.ipfs.io/#bafkreidripbo7vytlcwvtko2mdl54jfknp3nuowqbr6s5pllkmksoy2mc4
    <div className="flex items-center">
      <a
        href={`https://cid.ipfs.io/#${cid}`}
        className="block font-mono no-underline lowercase break-all"
        rel="noreferrer"
        target="_blank"
      >
        {clampedCid}
        <span className="font-sans opacity-40 text-sm">↗</span>
      </a>
      <CopyButton className="ml-2 btn-light text-sm" toCopy={cid} />
    </div>
  );
}
