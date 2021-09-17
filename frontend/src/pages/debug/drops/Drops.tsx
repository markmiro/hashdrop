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
import { createUserJson, UserJson } from "../../../components/UserJson";
import { useContract } from "../../../eth-react/useContract";
import { useMetaMaskEthereum } from "../../../eth-react/useMetaMaskEthereum";
import { Json } from "../../../generic/Json";
import { Loader } from "../../../generic/Loader";
import { Drops as DropsT } from "../../../typechain";
import { cidToUrl } from "../../../util/pinata";
import { DropView } from "./DropView";
import { DropItem } from "./DropItem";
import { initialUserJson, reducer } from "./userJsonReducer";

export function Drops() {
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
              <ButtonGroup>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
                <Button
                  colorScheme="blue"
                  onClick={() => setEditing(false)}
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
          {_.values(userJson?.drops).map((drop) => (
            <DropItem
              key={drop.cid}
              drop={drop}
              editing={editing}
              dispatch={dispatch}
            />
          ))}
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
