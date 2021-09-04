import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { ChainId, chains } from "eth-chains";
import { ethers } from "ethers";
import ReactJson from "react-json-view";
import chainData from "../chains.json";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { Anchor } from "../generic/Anchor";

const chainIds = [
  ChainId.EthereumMainnet,
  ChainId.EthereumTestnetRopsten,
  ChainId.EthereumTestnetKovan,
  ChainId.EthereumTestnetRinkeby,
  ChainId.EthereumTestnetGörli,
  ChainId.ArbitrumTestnetRinkeby,
  ChainId.OptimisticEthereum,
  ChainId.OptimisticEthereumTestnetGoerli,
  ChainId.OptimisticEthereumTestnetKovan,
  ChainId.MaticMainnet,
  ChainId.MaticTestnetMumbai,
];

const chainIdRpcConnect = (chainId: number) => {
  if (!(chainId in chainData)) return {};
  const c = (chainData as any)[chainId];
  if (!c) return {};
  return {
    chainName: c.name,
    chainId: ethers.utils.hexValue(c.chainId),
    nativeCurrency: {
      name: c.nativeCurrency.name,
      symbol: c.nativeCurrency.symbol,
      decimals: c.nativeCurrency.decimals,
    },
    rpcUrls: c.rpc,
    blockExplorerUrls:
      c.explorers && c.explorers.length > 0
        ? [...c.explorers.map((e: any) => e.url)]
        : [],
  };
};

export function EthChains() {
  const provider = useEthersProvider();

  const addId = (chainId: number) => {
    // https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
    provider
      .send("wallet_addEthereumChain", [chainIdRpcConnect(chainId)])
      .then((res) => console.log(res));
  };

  const connectId = (chainId: number) => {
    // https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
    provider
      .send("wallet_switchEthereumChain", [
        { chainId: ethers.utils.hexValue(chainId) },
      ])
      .then((res) => console.log(res));
  };

  return (
    <>
      <VStack spacing={2} align="stretch">
        {chainIds.map((id) => {
          const info = chains.getById(id);
          if (!info) return null;
          return (
            <Box
              key={id}
              px={4}
              py={2}
              shadow="md"
              rounded="md"
              borderWidth={1}
            >
              <VStack align="stretch">
                <HStack spacing={2}>
                  <b>{info.name}</b> <Badge>{info.shortName}</Badge>
                </HStack>
                <VStack spacing={2} align="start">
                  <Anchor isExternal to={info.infoURL}>
                    {info.infoURL}
                  </Anchor>
                  {info.faucets.map((f) => (
                    <Anchor key={f} isExternal to={f}>
                      {f}
                    </Anchor>
                  ))}
                </VStack>
                <ButtonGroup>
                  <Button onClick={() => addId(id)}>Add</Button>
                  <Button onClick={() => connectId(id)}>Connect</Button>
                </ButtonGroup>
              </VStack>
              <ReactJson
                src={(chainData as any)[id]}
                displayDataTypes={false}
                quotesOnKeys={false}
                displayObjectSize={false}
                enableClipboard={false}
              />
            </Box>
          );
        })}
      </VStack>
      <ReactJson
        src={chainIds.map((id) => chains.getById(id))}
        // src={chainData}
        displayDataTypes={false}
        quotesOnKeys={false}
        displayObjectSize={false}
        enableClipboard={false}
      />
    </>
  );
}
