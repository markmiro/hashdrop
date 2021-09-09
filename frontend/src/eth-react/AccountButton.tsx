import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useToast,
} from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { useCallback } from "react";
import Blockies from "react-blockies";
import { useErrorHandler } from "react-error-boundary";
import { FaEthereum } from "react-icons/fa";
import { Loader } from "../generic/Loader";
import { BlockExplorerLink } from "./BlockExplorerLink";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";
import { prettyAccountBalance, truncateEthAddress } from "./utils";

const FindingAccount = () => (
  <Menu>
    <MenuButton as={Button} size="sm" variant="outline">
      <Loader>Fetching account</Loader>
    </MenuButton>
  </Menu>
);

const ConnectWallet = () => {
  const toast = useToast();
  const handleError = useErrorHandler();
  const { ethereum } = useMetaMaskEthereum();

  const connect = () => {
    if (!ethereum) {
      handleError("ethereum is not set.");
      return;
    }
    ethereum.request({ method: "eth_requestAccounts" }).catch((err) => {
      toast({
        title: err.message,
        status: "error",
      });
    });
  };

  return (
    <Button
      onClick={connect}
      colorScheme="blue"
      size="sm"
      leftIcon={<FaEthereum />}
    >
      Connect Wallet
    </Button>
  );
};

export function AccountButton() {
  const { data, loading } = useMetaMaskEthereum();
  const toast = useToast();

  const handleCopyAddress = useCallback(() => {
    copy(data.selectedAddress || "");
    toast({
      title: "Copied.",
      status: "success",
      duration: 1000,
    });
  }, [data.selectedAddress, toast]);

  if (!data || !data.selectedAddress) return <ConnectWallet />;
  if (loading || !data.selectedAddressBalance) return <FindingAccount />;

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
            <Blockies seed={data.selectedAddress} scale={2} />
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={handleCopyAddress}
            display="flex"
            alignItems="center"
          >
            <div>Copy address</div>
            <Spacer />
            <CopyIcon />
          </MenuItem>
          {/* <MenuDivider /> */}
          <BlockExplorerLink
            address={data.selectedAddress}
            display="flex"
            alignItems="center"
            px={3}
            py={2}
            _hover={{ bg: "blackAlpha.100" }}
          >
            Block explorer
            <Spacer />
            <ExternalLinkIcon />
          </BlockExplorerLink>
        </MenuList>
      </Menu>
    </HStack>
  );
}
