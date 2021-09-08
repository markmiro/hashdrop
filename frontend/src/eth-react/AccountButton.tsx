import { Box, Button, HStack, Menu, MenuButton, Text } from "@chakra-ui/react";
import Blockies from "react-blockies";
import { Loader } from "../generic/Loader";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";
import { prettyAccountBalance, truncateEthAddress } from "./utils";

const FindingAccount = () => (
  <Menu>
    <MenuButton as={Button} size="sm" variant="outline">
      <Loader>Finding account</Loader>
    </MenuButton>
  </Menu>
);

const NoAccount = () => (
  <Menu>
    <MenuButton as={Button} size="sm" variant="outline">
      No Account
    </MenuButton>
  </Menu>
);

export function AccountButton() {
  const { data, loading } = useMetaMaskEthereum();

  if (loading || !data.selectedAddressBalance) return <FindingAccount />;
  if (!data) return <NoAccount />;

  return (
    <HStack align="center" spacing={1}>
      <Text fontFamily="mono" fontSize="sm"></Text>
      <Menu>
        <MenuButton as={Button} size="sm" variant="outline">
          <HStack spacing={2} alignItems="center">
            <Box fontFamily="mono">
              <Text as="span" opacity="50%">
                {prettyAccountBalance(data.selectedAddressBalance)} ETH –{" "}
              </Text>
              {truncateEthAddress(data.selectedAddress)}
            </Box>
            <Blockies seed={data.selectedAddress ?? ""} scale={2} />
          </HStack>
        </MenuButton>
      </Menu>
    </HStack>
  );
}
