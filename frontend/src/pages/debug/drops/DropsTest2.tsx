import { Button } from "@chakra-ui/button";
import { Center, Link } from "@chakra-ui/layout";
import axios from "axios";
import { useState } from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Cid } from "../../../eth-react/Cid";
import {
  cidToUrl,
  dataUrlToBlob,
  pinBlob,
  useEncrypter,
} from "../../../util/dropUtils";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function DropsTest2() {
  const query = useQuery();
  const match = useRouteMatch<{ cid: string }>("/debug/drops/:cid");
  const [dataUrl2, setDataUrl2] = useState("");
  const encrypter = useEncrypter();

  const pinDecryptedText = async () => {
    const cid = match?.params.cid;
    if (!cid) {
      throw new Error(
        "`cid` expected to be set in url param: /debug/drops/:cid"
      );
    }

    const encCid = query.get("encCid");
    if (!encCid) {
      throw new Error("`encCid` in query string expected to be set");
    }

    const res = await axios.get(cidToUrl(encCid));
    const downloadedEncrypted = res.data;

    const decryptedDataUrl = await encrypter.decrypt(downloadedEncrypted, cid);
    setDataUrl2(decryptedDataUrl);
    console.log(decryptedDataUrl);
    // console.log("decrypted === dataUrl", decrypted === dataUrl);

    const fob2 = await dataUrlToBlob(decryptedDataUrl);
    const cid2 = await pinBlob(fob2);
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
              <Cid cid={match?.params.cid} />
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
