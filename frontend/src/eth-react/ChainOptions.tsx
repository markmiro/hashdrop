import { UpDownIcon } from "@chakra-ui/icons";
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
  Text,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useState } from "react";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { Loader } from "../generic/Loader";
import { ChainId } from "./chainData";
import { chains } from "./chains";
import { InstallMetaMaskMessage } from "./Errors";
import { MetaMaskOverlay } from "./MetaMaskOverlay";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

const ChainDisplay = ({ chainId }: { chainId: number }) => {
  const chain = chains.showableById(chainId as ChainId);

  return (
    <HStack spacing={2} alignItems="center" w="100%">
      <Circle size="1em" bg={chain.color} boxShadow="xs" />
      <Text isTruncated>{chain.name}</Text>
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
  const [connecting, setConnecting] = useState(false);
  const { ethereum, data } = useMetaMaskEthereum();

  const setOrAddChain = (chainId: number) => {
    if (!ethereum) return;
    setConnecting(true);
    if (chainId === data.chainId) {
      toast({ title: "Already connected." });
      setConnecting(false);
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
        .catch((err) => {
          toast({ title: err.message, status: "error" });
        })
        .finally(() => setConnecting(false));
      return;
    }
    ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [addableChain],
      })
      .catch((err) => {
        toast({ title: err.message, status: "error" });
      })
      // Ideally, want to only cancel if there's an error. Otherwise we'd like to keep the connecting
      // screen up until the page reloads via `reloadOnChainChanged`. However, it looks like there's a bug
      // in how MetaMask handles switching to a chain that's already been added via `wallet_addEthereumChain`.
      // It should return an error but it doesn't.
      .finally(() => setConnecting(false));
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
        maxW="100%"
        rightIcon={<UpDownIcon />}
        overflow="hidden"
        {...buttonProps}
      >
        {data.chainId ? (
          <ChainDisplay chainId={data.chainId} />
        ) : (
          "Choose a chain"
        )}
      </MenuButton>
      <MenuList minW="sm">
        {chainIds
          .filter((id) => id !== data.chainId)
          .map((chainId) => (
            <MenuItem key={chainId} onClick={() => setOrAddChain(chainId)}>
              <ChainDisplay chainId={chainId} />
            </MenuItem>
          ))}
      </MenuList>
      <MetaMaskOverlay isOpen={connecting} onClose={() => setConnecting(false)}>
        &nbsp;
      </MetaMaskOverlay>
    </Menu>
  );
}
