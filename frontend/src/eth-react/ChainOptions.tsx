import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  ButtonProps,
  Circle,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { ChainId } from "./chainData";
import { chains } from "./chains";
import { InstallMetaMaskMessage } from "./Errors";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

const ChainDisplay = ({ chainId }: { chainId: number }) => {
  const chain = chains.showableById(chainId as ChainId);

  return (
    <HStack spacing={2} alignItems="center" w="100%">
      <Circle size="1em" bg={chain.color} boxShadow="xs" />
      <div>{chain.name}</div>
      <Spacer />
      {process.env.NODE_ENV === "development" && (
        <Box fontSize="xs" fontWeight="normal" opacity="50%" display="inline">
          ID: {chainId}
        </Box>
      )}
      {chain.testnet && <Badge colorScheme="orange">testnet</Badge>}
    </HStack>
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

  const setOrAddChain = (chainId: number) => {
    if (!ethereum) return;
    if (chainId === data.chainId) {
      toast({ title: "Already connected." });
      return;
    }
    if (!chainId) {
      toast({
        title: `Seems like you're not connected to a chain.`,
        status: "error",
      });
      return;
    }
    const addableChain = chains.addableById(chainId);
    // If the chain can't be added, it's either because it's a local chain or it's a preset chain in MetaMask
    if (!addableChain) {
      ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.utils.hexValue(chainId) }],
        })
        .catch((err) => toast({ title: err.message, status: "error" }));
      return;
    }
    ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [addableChain],
      })
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
        {...buttonProps}
      >
        {data.chainId ? (
          <ChainDisplay chainId={data.chainId} />
        ) : (
          "Choose a chain"
        )}
      </MenuButton>
      <MenuList minW="sm">
        {chainIds.map((chainId) => (
          <MenuItem key={chainId} onClick={() => setOrAddChain(chainId)}>
            <ChainDisplay chainId={chainId} />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
