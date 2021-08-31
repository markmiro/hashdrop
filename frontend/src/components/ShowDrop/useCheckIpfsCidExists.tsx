import delay from "delay";
import { useCallback, useEffect, useState } from "react";
import { fetchWithTimeout } from "../../util/fetchWithTimeout";
import { cidToUrl } from "../../util/pinata";

export type ShowDropState = "INITIAL" | "LOADING" | "NOT_FOUND" | "FOUND";

export function useCheckIpfsCidExists(cid: string) {
  const [state, setState] = useState<ShowDropState>("INITIAL");

  const check = useCallback(async (cid: string) => {
    try {
      setState("LOADING");
      await delay(1000);

      await fetchWithTimeout(cidToUrl(cid));
      setState("FOUND");
    } catch (err) {
      setState("NOT_FOUND");
    }
  }, []);

  useEffect(() => {
    // Reset `cidFound` so UI waits until API comes back with success before trying to show the file.
    setState("INITIAL");
    check(cid);
  }, [cid, check]);

  return { state, checkAgain: () => check(cid) };
}
