import { AddIcon, CheckIcon, EditIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  HStack,
  Input,
  Spacer,
  Tooltip,
  VStack,
} from "@chakra-ui/react";

import axios from "axios";
import { format, formatDistanceToNow } from "date-fns/esm";
import delay from "delay";
import _ from "lodash";
import { useReducer } from "react";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { Link as RouterLink, Route, Switch } from "react-router-dom";
import { createUserJson, UserJson } from "../../components/UserJson";
import { useContract } from "../../eth-react/useContract";
import { useMetaMaskEthereum } from "../../eth-react/useMetaMaskEthereum";
import { Loader } from "../../generic/Loader";
import { Drops as DropsT } from "../../typechain";
import { cidToUrl } from "../../util/pinata";
import { reducer, initialUserJson } from "../../components/userJsonReducer";
import { IFramePreview } from "../../components/IFramePreview";
import { MonoText } from "../../generic/MonoText";

const RelativeTs = ({ ts }: { ts: number }) => (
  <Tooltip label={format(new Date(ts), "PPpp")}>
    {formatDistanceToNow(new Date(ts), {
      addSuffix: true,
    })}
  </Tooltip>
);

function CidView({
  cid,
  userJson,
}: {
  cid?: string | null;
  userJson?: UserJson;
}) {
  if (!cid)
    return (
      <Center
        w="100%"
        h="40vh"
        fontSize="xl"
        fontWeight="medium"
        bg="blackAlpha.100"
      >
        👈 Choose an item.
      </Center>
    );

  const privateCid = userJson?.drops[cid]?.privateCid;
  if (privateCid) {
    return (
      <div>
        <MonoText>Private CID: {privateCid}</MonoText>
        <br />
        <MonoText>CID: {cid}</MonoText>
      </div>
    );
    // return <IFramePreview src={cidToUrl(cid)} />;
  }

  return <IFramePreview src={cidToUrl(cid)} />;
}

export function DropsTest() {
  const { data } = useMetaMaskEthereum();
  const drops = useContract<DropsT>("Drops");
  const [userJson, dispatch] = useReducer(reducer, initialUserJson);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const doAsync = async () => {
      setLoading(true);

      if (!drops.contract) return new Error("No 'Drops smart contract");
      if (!data.selectedAddress) return new Error("No address selected");

      const userAddress = data.selectedAddress;
      const userCid = await drops.contract.addressToRootCid(userAddress);
      const userJson = userCid
        ? (await axios.get<UserJson>(cidToUrl(userCid))).data
        : createUserJson(userAddress);
      await delay(200);

      debugger;
      dispatch({ type: "SET", value: userJson });
      setLoading(false);
    };
    doAsync();
  }, [drops.contract, data.selectedAddress]);

  if (loading) return <Loader>Loading user data</Loader>;

  return (
    <div>
      <HStack spacing={4} alignItems="start">
        <VStack spacing={4} alignItems="stretch" minW="lg">
          <Flex>
            {editing ? (
              <Button
                onClick={() => setEditing(false)}
                leftIcon={<CheckIcon />}
              >
                Save All
              </Button>
            ) : (
              <Button onClick={() => setEditing(true)} leftIcon={<EditIcon />}>
                Edit
              </Button>
            )}
            <Spacer />
            <Button as={RouterLink} to="/debug/drop" leftIcon={<AddIcon />}>
              Add
            </Button>
          </Flex>
          {_.values(userJson?.drops).map((drop) => (
            <Box px={4} py={2} borderWidth={1}>
              <VStack spacing={2}>
                <Box fontWeight="bold" w="100%" textAlign="center">
                  {editing ? (
                    <Input
                      size="sm"
                      w="100%"
                      value={drop.dropTitle}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_TITLE",
                          key: drop.cid,
                          value: e.target.value,
                        })
                      }
                      fontWeight="inherit"
                      fontSize="inherit"
                      lineHeight="short"
                      textAlign="inherit"
                    />
                  ) : (
                    drop.dropTitle
                  )}
                </Box>
                <Badge colorScheme="green">notarized</Badge>
                <ButtonGroup>
                  <Button as={RouterLink} to={`/debug/drops/${drop.cid}`}>
                    Open
                  </Button>
                  <Button>Notarize</Button>
                </ButtonGroup>
                <HStack spacing={1} fontSize="xs">
                  <span>
                    Created <RelativeTs ts={drop.created} />
                  </span>
                  <span>•</span>
                  <span>
                    Modified <RelativeTs ts={drop.modified} />
                  </span>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
        <Switch>
          <Route
            path="/debug/drops/:cid"
            render={(props) => (
              <CidView cid={props.match.params.cid} userJson={userJson} />
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
      </HStack>
      <ReactJson
        src={userJson || {}}
        displayDataTypes={false}
        quotesOnKeys={false}
        displayObjectSize={false}
        enableClipboard={false}
      />
    </div>
  );
}
