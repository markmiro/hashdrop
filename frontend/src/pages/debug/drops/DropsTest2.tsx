import { Button } from "@chakra-ui/button";
import { Center, Link } from "@chakra-ui/layout";
import axios from "axios";
import { useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Cid } from "../../../eth-react/Cid";
import { cidToUrl, dataUrlToBlob, decrypt } from "../../../util/dropUtils";
import { pinFile } from "../../../util/pinata";

export function DropsTest2() {
  const match = useRouteMatch<{ cid: string }>("/debug/drops/:cid");
  const [dataUrl2, setDataUrl2] = useState("");
  const [cid, setCid] = useState("");

  const pinDecryptedText = async () => {
    const encCid = match?.params.cid;
    if (!encCid) {
      throw new Error("Expected `match?.params.cid` to be set");
    }
    const res = await axios.get(cidToUrl(encCid));
    const downloadedEncrypted = res.data;

    const decryptedDataUrl = decrypt(downloadedEncrypted);
    setDataUrl2(decryptedDataUrl);
    console.log(decryptedDataUrl);
    // console.log("decrypted === dataUrl", decrypted === dataUrl);

    const fob2 = await dataUrlToBlob(decryptedDataUrl);
    const cid2 = await pinFile(fob2);
    setCid(cid2);
  };

  return (
    <div>
      DropsTest2
      {/* <Link as={RouterLink} to={`/debug/drops/${encCid}`}>
        Drop It
      </Link> */}
      <Switch>
        <Route
          path="/debug/drops/:cid"
          render={(props) => (
            <div>
              <Button onClick={pinDecryptedText}>
                Pin encrypted on Pinata
              </Button>
              <Cid cid={cid} />
              <iframe
                style={{ border: "1px solid" }}
                title="dataUrl"
                src={dataUrl2}
                width="100%"
                height="300px"
              />
            </div>
          )}
        />
        <Route path="*">
          <Center
            w="100%"
            h="40vh"
            fontSize="xl"
            fontWeight="medium"
            bg="blackAlpha.50"
          >
            👈 Choose an item.
          </Center>
        </Route>
      </Switch>
    </div>
  );
}
