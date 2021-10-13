import { AddIcon, CheckIcon, EditIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Center,
  Flex,
  HStack,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import delay from "delay";
import _ from "lodash";
import { useEffect, useReducer, useState } from "react";
import { Link as RouterLink, Route, Switch } from "react-router-dom";
import { createUserJson, UserJson } from "../../../util/UserJson";
import { useContract } from "../../../eth-react/useContract";
import { useMetaMaskEthereum } from "../../../eth-react/useMetaMaskEthereum";
import { Json } from "../../../generic/Json";
import { Loader } from "../../../generic/Loader";
import { Drops as DropsT } from "../../../typechain";
import { cidToUrl, pinFile } from "../../../util/pinata";
import { DropView } from "./DropView";
import { DropItem } from "./DropItem";
import { initialUserJson, reducer } from "../../../util/userJsonReducer";
import { textToBlob } from "../../../util/textToBlob";
import { ipfsCid } from "../../../util/ipfsCid";
import { useEthersProvider } from "../../../eth-react/EthersProviderContext";
import { useUser } from "../../../util/useUser";

export function Drops() {
  const { data } = useMetaMaskEthereum();
  const drops = useContract<DropsT>("Drops");
  const provider = useEthersProvider();
  const { userJson, dispatch, loading: loadingUser } = useUser();
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    if (!drops.contract) return new Error("No 'Drops smart contract");
    if (!data.selectedAddress) return new Error("No address selected");

    const newUserBlob = textToBlob(JSON.stringify(userJson));
    const newUserCid = await ipfsCid(newUserBlob);
    const remoteNewUserCid = await pinFile(newUserBlob);
    if (newUserCid !== remoteNewUserCid) {
      return new Error("User JSON: Local and remote CID don't match.");
    }

    const signer = provider.getSigner();
    const dropsTx = await drops.contract.connect(signer).set(newUserCid);
    await dropsTx.wait();

    setEditing(false);
  };

  if (loadingUser) {
    return <Loader>Loading user</Loader>;
  }

  return (
    <div>
      <HStack spacing={4} alignItems="start">
        <VStack spacing={4} alignItems="stretch" minW="lg">
          <Flex>
            {editing ? (
              <ButtonGroup>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSave}
                  leftIcon={<CheckIcon />}
                >
                  Save All
                </Button>
              </ButtonGroup>
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
          {_.values(_.orderBy(userJson?.drops, "created", "desc")).map(
            (drop) => (
              <DropItem
                key={drop.cid}
                drop={drop}
                editing={editing}
                onSetTitle={(title) =>
                  dispatch({
                    type: "SET_TITLE",
                    key: drop.cid,
                    value: title,
                  })
                }
              />
            )
          )}
        </VStack>
        <Switch>
          <Route
            path="/debug/drops/:cid"
            render={(props) => (
              <div>
                {/* Use `key` to force reload component when cid changes */}
                <DropView
                  key={props.match.params.cid}
                  cid={props.match.params.cid}
                  userJson={userJson}
                />
                <Json
                  name="drop"
                  src={userJson?.drops[props.match.params.cid]}
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
      </HStack>
      <Json src={userJson} />
    </div>
  );
}
