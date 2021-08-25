import React from "react";
import { CopyButton } from "./CopyButton";

export function Cid({ cid }: { cid?: string }) {
  if (!cid) return <div>N/A</div>;
  return (
    // https://cid.ipfs.io/#bafkreidripbo7vytlcwvtko2mdl54jfknp3nuowqbr6s5pllkmksoy2mc4
    <div className="flex items-start">
      <a
        href={`https://cid.ipfs.io/#${cid}`}
        className="db link black underline flex-grow-1"
        rel="noreferrer"
        target="_blank"
        style={{
          wordBreak: "break-all",
        }}
      >
        {cid} ↗
      </a>
      <CopyButton className="ml2" toCopy={cid} />
    </div>
  );
}
