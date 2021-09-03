import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  ButtonProps,
  Circle,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { utils } from "ethers";
import { useState } from "react";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { chainIdToInfo } from "./chainIdToInfo";
import { InstallMetaMaskMessage } from "./Errors";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

const ChainDisplay = ({ chainId }: { chainId: number }) => {
  const info = chainIdToInfo(chainId);

  return (
    <Flex alignItems="center" width="100%">
      <Circle size="1em" bg={info.color} boxShadow="xs" mr="2" />
      {info.name}
      <Spacer />
      <Box
        fontSize="xs"
        mr="2"
        fontWeight="normal"
        opacity="50%"
        display="inline"
      >
        ID: {chainId}
      </Box>
      {info.type === "test" && <Badge variant="outline">test</Badge>}
    </Flex>
  );
};

export function ChainOptions({
  chainIds,
  buttonProps,
}: {
  chainIds: number[];
  buttonProps?: ButtonProps;
}) {
  const toast = useToast();
  const { ethereum, data } = useMetaMaskEthereum();
  const [chainId, setChainId] = useState(data.chainId);

  const updateChainId = (chainId: number) => {
    const hexChainId = utils.hexValue(chainId);
    if (!ethereum) return;
    if (data.chainId === chainId) return;
    ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      })
      .then(() => setChainId(chainId))
      .catch((err) => toast({ title: err.message, status: "error" }));
  };

  if (!ethereum) {
    return (
      <ErrorMessage>
        <InstallMetaMaskMessage />
      </ErrorMessage>
    );
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        textAlign="left"
        rightIcon={<ChevronDownIcon />}
        isFullWidth
        {...buttonProps}
      >
        {chainId ? <ChainDisplay chainId={chainId} /> : "Choose a chain"}
      </MenuButton>
      <MenuList minW="sm">
        {chainIds.map((chainId) => (
          <MenuItem key={chainId} onClick={() => updateChainId(chainId)}>
            <ChainDisplay chainId={chainId} />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
