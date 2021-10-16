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
import _ from "lodash";
import { useState } from "react";
import { Link as RouterLink, Route, Switch } from "react-router-dom";
import { Json } from "../../../generic/Json";
import { Loader } from "../../../generic/Loader";
import { useUser } from "../../../util/useUser";
import { DropItem } from "./DropItem";
import { DropView } from "./DropView";

export function Drops() {
  const { userJson, dispatch, save, loading: loadingUser } = useUser();
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    await save(userJson);
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
