import { User as UserT, HashDrop as HashDropT } from "../typechain";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { useContract } from "../eth-react/useContract";
import { useMetaMaskEthereum } from "../eth-react/useMetaMaskEthereum";

export class Dropper {
  cid: string = "";
  fob: File | Blob | null = null;
  dataUrl: string = "";

  fromFile() {}
  fromText() {}
  fromCid() {}

  // Encrypt
  // Pin Encrypted
  // Decrypt
  //
}

export class TextDropper {
  text = "";
  fromText(text: string) {
    const dropper = new TextDropper();
    dropper.text = text;
    return dropper;
  }
  fromCid() {}
}

export function useDrops() {
  const { data } = useMetaMaskEthereum();
  const provider = useEthersProvider();
  const user = useContract<UserT>("User");
  const hashdrop = useContract<HashDropT>("HashDrop");

  // return {
  //   userData,
  //   addPrivate,
  // };
}
