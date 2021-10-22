import { useState } from "react";
import {
  cidToUrl,
  dataUrlToBlob,
  pinBlob,
  retrieveCidFromOtherServer,
  useEncrypter,
} from "../../util/dropUtils";
import axios from "axios";
import { useStepper } from "../Stepper";

export enum DecryptSteps {
  Load,
  Decrypt,
  Publish,
  CheckAvailable,
}

export function useDecrypter() {
  const [cid, setCid] = useState("");
  const [availableAttemptCount, setAvailableAttemptCount] = useState(0);
  const stepper = useStepper({
    activeIndex: -1,
    steps: {
      [DecryptSteps.Load]: { isDone: false },
      [DecryptSteps.Decrypt]: { isDone: false },
      [DecryptSteps.Publish]: { isDone: false },
      [DecryptSteps.CheckAvailable]: { isDone: false },
    },
  });
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const encrypter = useEncrypter();

  async function decrypt(cid: string, privateCid: string) {
    let downloadedEncrypted: string;
    await stepper.takeStep(DecryptSteps.Load, async () => {
      const res = await axios.get(cidToUrl(privateCid));
      downloadedEncrypted = res.data;
    });
    await stepper.takeStep(DecryptSteps.Decrypt, async () => {
      const dataUrl = await encrypter.decrypt(downloadedEncrypted, cid);
      setDataUrl(dataUrl);
      setCid(cid);
    });
  }

  async function publish() {
    setAvailableAttemptCount(0);
    if (!dataUrl || !cid) throw new Error("File not decrypted yet.");
    await stepper.takeStep(DecryptSteps.Publish, async () => {
      const fob = await dataUrlToBlob(dataUrl);
      const remoteCid = await pinBlob(fob).catch(() => {
        throw new Error("Error publishing");
      });
      // This should never fail, but just in case
      if (cid !== remoteCid) {
        debugger;
        throw new Error("Uploaded file CID doesn't match the expected CID.");
      }
    });

    await stepper.takeStep(DecryptSteps.CheckAvailable, async () => {
      setAvailableAttemptCount(0);
      await retrieveCidFromOtherServer(cid, (count) =>
        setAvailableAttemptCount(count)
      ).catch(() => {
        throw new Error("Not available.");
      });
    });
    stepper.completeToStep(DecryptSteps.CheckAvailable);
  }

  return { stepper, decrypt, publish, dataUrl, availableAttemptCount };
}
