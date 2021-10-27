import { useEffect, useState } from "react";
import { useContract } from "../eth-react/useContract";
import { Loader } from "../generic/Loader";
import { HashDrop as T } from "../typechain";

export function LatestDrops() {
  const hashdrop = useContract<T>("HashDrop");
  const [cids, setCids] = useState<string[]>([]);

  useEffect(() => {
    const doAsync = async () => {
      if (!hashdrop.contract) return;

      let i = 0;
      let cids: string[] = [];
      while (true) {
        try {
          const cid = await hashdrop.contract.cids(i);
          i++;
          cids.push(cid);
        } catch (err) {
          break;
        }
      }
      setCids(cids);
    };
    doAsync();
  }, [hashdrop.contract]);

  if (hashdrop.isLoading) {
    return <Loader>Loading</Loader>;
  }

  return (
    <div>
      Latest Drops
      {cids.map((cid) => (
        <div key={cid}>{cid}</div>
      ))}
    </div>
  );
}
