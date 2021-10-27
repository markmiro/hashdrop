import delay from "delay";
import { useEffect, useState } from "react";
import { useContract } from "../eth-react/useContract";
import { Loader } from "../generic/Loader";
import { HashDrop as T } from "../typechain";

export function DropCount() {
  const hashdrop = useContract<T>("HashDrop");

  const [dropCount, setDropCount] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doAsync = async () => {
      setLoading(true);
      if (!hashdrop.contract) return;
      await delay(500);
      const dropCount = (await hashdrop.contract.dropCount()).toNumber();
      setDropCount(dropCount);
      setLoading(false);
    };
    doAsync();
  }, [hashdrop.contract]);

  if (loading) return <Loader>Total drop count by all users</Loader>;

  return <div>Total drop count by all users: {dropCount ?? "N/A"}</div>;
}
