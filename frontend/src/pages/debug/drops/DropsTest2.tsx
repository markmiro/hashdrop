import { Button } from "@chakra-ui/button";
import { useBoolean } from "@chakra-ui/react";
import _ from "lodash";
import { Center, Link } from "@chakra-ui/layout";
import axios from "axios";
import { useState } from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Cid } from "../../../eth-react/Cid";
import { Loader } from "../../../generic/Loader";
import { Anchor } from "../../../generic/Anchor";
import {
  cidToUrl,
  dataUrlToBlob,
  pinBlob,
  useEncrypter,
} from "../../../util/dropUtils";
import { useUser } from "../../../util/useUser";
import { Json } from "../../../generic/Json";

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
  const { userJson, loading: loadingUser } = useUser();
  const [showIframe, setShowIframe] = useBoolean();

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

    debugger;
    const downloadedEncrypted = res.data;

    const decryptedDataUrl = await encrypter.decrypt(downloadedEncrypted, cid);
    setDataUrl2(decryptedDataUrl);
    console.log(decryptedDataUrl);
    // console.log("decrypted === dataUrl", decrypted === dataUrl);

    const fob2 = await dataUrlToBlob(decryptedDataUrl);
    const cid2 = await pinBlob(fob2);

    alert("done!");
  };

  if (loadingUser) {
    return <Loader>Loading user</Loader>;
  }

  return (
    <div>
      DropsTest2
      <div>Drop count: {_.keys(userJson.drops).length ?? 0}</div>
      {userJson &&
        _.keys(userJson.drops).map((cid) => (
          <div key={cid}>
            <Link
              as={RouterLink}
              to={`/debug/drops/${cid}?encCid=${userJson.drops[cid].privateCid}`}
              color={cid === match?.params.cid ? "blue" : undefined}
            >
              Drop: {userJson.drops[cid].dropTitle}
            </Link>
          </div>
        ))}
      <Switch>
        <Route
          path="/debug/drops/:cid"
          render={(props) => (
            <div>
              <Button onClick={pinDecryptedText}>
                Pin encrypted on Pinata
              </Button>
              <Cid cid={match?.params.cid} />
              <Button onClick={setShowIframe.toggle}>Toggle Show iframe</Button>
              <Anchor isExternal to={`/api/get/${match?.params.cid}`}>
                Get
              </Anchor>
              {showIframe && match?.params.cid && (
                <iframe
                  style={{ border: "1px solid" }}
                  title="cid"
                  src={cidToUrl(match.params.cid)}
                  width="100%"
                  height="300px"
                />
              )}
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
      <Json src={{ userJson }} />
    </div>
  );
}
