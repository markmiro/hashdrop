import delay from "delay";
import { useCallback, useEffect, useState } from "react";
import { Cid } from "../generic/Cid";
import { Loader } from "../generic/Loader";
import { cidToUrl } from "../util/pinata";

export function ShowDrop({ cid }: { cid: string }) {
  const [loading, setLoading] = useState(false);
  const [cidPublished, setCidPublished] = useState(false);

  const checkWantedCid = useCallback(async (cid) => {
    try {
      setLoading(true);
      await delay(1000);
      const res = await fetch(cidToUrl(cid));
      if (res.status === 404) {
        throw new Error("Not found");
      }
      setCidPublished(true);
      setLoading(false);
    } catch (err) {
      setCidPublished(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset `cidPublished` so UI waits until API comes back with success before trying to show the file.
    setCidPublished(false);
    checkWantedCid(cid);
  }, [cid, checkWantedCid]);

  return (
    <div>
      <h1>Show Drop</h1>
      <div>
        <Cid cid={cid} />
      </div>
      {cidPublished ? (
        <iframe
          width="100%"
          title="ipfs preview"
          className="db ba"
          style={{ height: "20vh" }}
          src={cidToUrl(cid)}
        />
      ) : loading ? (
        <Loader />
      ) : (
        <div className="ba bg-washed-yellow orange pa3 tc">
          <h2 className="mv0 b f5">
            File for hash not published, or file published but cannot be found.
          </h2>
          <div className="pt2" />
          <p className="mv0">
            If you're the one who created the hash above, publish the file using
            something like <a href="https://pinata.cloud/">Pinata</a> once
            you're ready to share your secret message with the world.
          </p>
        </div>
      )}
    </div>
  );
}
