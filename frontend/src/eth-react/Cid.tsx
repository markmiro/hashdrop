import React from "react";
import { Anchor } from "../generic/Anchor";
import { CopyButton } from "../generic/CopyButton";
import { MonoText } from "../generic/MonoText";

const truncate = (str: string) => str.slice(0, 2) + "..." + str.slice(-6);

export function Cid({ cid }: { cid?: string }) {
  if (!cid) return <MonoText isDisabled>N/A</MonoText>;

  return (
    // https://cid.ipfs.io/#bafkreidripbo7vytlcwvtko2mdl54jfknp3nuowqbr6s5pllkmksoy2mc4
    <span>
      <Anchor to={`https://cid.ipfs.io/#${cid}`} isExternal>
        <MonoText>{truncate(cid)}</MonoText>
      </Anchor>
      <CopyButton ml="2" toCopy={cid} />
    </span>
  );
}
