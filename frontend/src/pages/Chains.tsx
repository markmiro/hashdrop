import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Circle,
  Divider,
  HStack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { FC } from "react";
import { ChainId } from "../eth-react/chainData";
import { chainIds, chains } from "../eth-react/chains";
import { useEthersProvider } from "../eth-react/EthersProviderContext";
import { Anchor } from "../generic/Anchor";

const Box2: FC = ({ children }) => (
  <Box px={4} py={2} shadow="md" rounded="md" borderWidth={1}>
    {children}
  </Box>
);

function Chain({ chainId }: { chainId: ChainId }) {
  const provider = useEthersProvider();

  const chain = chains.byId(chainId);

  const add = () => {
    // https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
    provider
      .send("wallet_addEthereumChain", [chains.addableById(chainId)])
      .then((res) => console.log(res));
  };

  const connect = () => {
    // https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
    provider
      .send("wallet_switchEthereumChain", [
        { chainId: ethers.utils.hexValue(chainId) },
      ])
      .then((res) => console.log(res));
  };

  return (
    <Box2>
      <VStack align="stretch">
        <HStack spacing={2}>
          <Circle size="1em" bg={chain.color} boxShadow="xs" mr="1" />
          <b>{chain.name}</b>
          {chain.testnet && <Badge colorScheme="orange">TESTNET</Badge>}
          <Spacer />
          <Badge colorScheme="blackAlpha" variant="outline">
            {chains.idToKey(chainId)}
          </Badge>
        </HStack>
        <VStack spacing={0} align="start" fontSize="sm">
          {chain.description && <Text fontSize="lg">{chain.description}</Text>}
          {chain.infoUrl && (
            <>
              <b>Info: </b>
              <Anchor isExternal to={chain.infoUrl}>
                {chain.infoUrl}
              </Anchor>
            </>
          )}
          {"faucets" in chain && (
            <>
              <b>Faucets: </b>
              {chain.faucets.map((f) => (
                <Anchor key={f} isExternal to={f}>
                  {f}
                </Anchor>
              ))}
            </>
          )}
          {"explorers" in chain && (
            <>
              <b>Explorers: </b>
              {chain.explorers.map((f) => (
                <Anchor key={f} isExternal to={f}>
                  {f}
                </Anchor>
              ))}
              <Anchor
                isExternal
                to={`${chain.explorers[0]}/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`}
              >
                0xf3...2266
              </Anchor>
            </>
          )}
        </VStack>
        <ButtonGroup>
          <Button onClick={add}>Add</Button>
          <Button onClick={connect}>Connect</Button>
        </ButtonGroup>
      </VStack>
    </Box2>
  );
}

export function Chains() {
  return (
    <>
      {Object.values(chainIds).map((id) => (
        <Chain key={id} chainId={id} />
      ))}
      <Divider />
    </>
  );
}
