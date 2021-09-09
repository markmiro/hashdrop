import { EditIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns/esm";
import delay from "delay";
import _ from "lodash";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { createUserJson, UserJson } from "../../components/UserJson";
import { useContract } from "../../eth-react/useContract";
import { useMetaMaskEthereum } from "../../eth-react/useMetaMaskEthereum";
import { Loader } from "../../generic/Loader";
import { Drops as DropsT } from "../../typechain";
import { cidToUrl } from "../../util/pinata";

const RelativeTs = ({ ts }: { ts: number }) => (
  <Tooltip label={format(new Date(ts), "PPpp")}>
    {formatDistanceToNow(new Date(ts), {
      addSuffix: true,
    })}
  </Tooltip>
);

export function DropsTest() {
  const { data } = useMetaMaskEthereum();
  const drops = useContract<DropsT>("Drops");
  const [userJson, setUserJson] = useState<UserJson | null | "loading">(null);

  useEffect(() => {
    const doAsync = async () => {
      setUserJson("loading");

      if (!drops.contract) return new Error("No 'Drops smart contract");
      if (!data.selectedAddress) return new Error("No address selected");

      const userAddress = data.selectedAddress;
      const userCid = await drops.contract.addressToRootCid(userAddress);
      const userJson = userCid
        ? (await axios.get<UserJson>(cidToUrl(userCid))).data
        : createUserJson(userAddress);
      await delay(200);
      setUserJson(userJson);
    };
    doAsync();
  }, [drops.contract, data.selectedAddress]);

  if (userJson === "loading") return <Loader>Loading user data</Loader>;

  return (
    <div>
      <VStack spacing={4} alignItems="stretch">
        {_.values(userJson?.drops).map((drop) => (
          <Box px={4} py={2} borderWidth={1}>
            <b>
              {drop.dropTitle}
              <IconButton
                ml="2"
                size="xs"
                aria-label="edit"
                icon={<EditIcon />}
              />
            </b>
            <Badge colorScheme="green">notarized</Badge>
            <HStack spacing={1} fontSize="xs">
              <span>
                Created <RelativeTs ts={drop.created} />
              </span>
              <span>•</span>
              <span>
                Modified <RelativeTs ts={drop.modified} />
              </span>
            </HStack>
          </Box>
        ))}
        <Button colorScheme="blue" size="lg">
          Save All
        </Button>
      </VStack>
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
