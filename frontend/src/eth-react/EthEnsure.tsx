import {
  Box,
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC } from "react";
import { useErrorHandler } from "react-error-boundary";
import { FaEthereum } from "react-icons/fa";
import { ErrorMessage } from "../generic/Errors/ErrorMessage";
import { Loader } from "../generic/Loader";
import { ChainOptions } from "./ChainOptions";
import { CurrentChainName } from "./CurrentChainName";
import {
  InstallMetaMaskMessage,
  MultipleWalletsMessage,
  ReloadLink,
} from "./Errors";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

type Props = {
  isConnectedToChain?: boolean;
  chainIds?: number[];
  isConnected?: boolean;
  isNonZeroBalance?: boolean;
};

const ModalMessage: FC = ({ children }) => {
  return (
    <Modal isOpen onClose={() => {}} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <div>✋ Before you continue...</div>
          </HStack>
        </ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <VStack spacing={2} alignItems="start">
            {children}
          </VStack>
        </ModalBody>

        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const EthEnsure: FC<Props> = (props) => {
  const { children, ...expect } = props;
  // Need to check connection if expecting to be connected to a specific chain id
  if (expect.chainIds) expect.isConnected = true;
  // Need to check connection if checking for balance
  if (expect.isNonZeroBalance) expect.isConnected = true;

  const handleError = useErrorHandler();
  const { loading, data, ethereum } = useMetaMaskEthereum();

  if (loading) {
    return (
      <Loader>
        Checking <CurrentChainName /> wallet
      </Loader>
    );
  }

  // Basic checks
  // ---

  if (!ethereum) {
    return (
      <ModalMessage>
        <Flex textAlign="center">
          <InstallMetaMaskMessage />
        </Flex>
      </ModalMessage>
    );
  }

  if (data.hasMultipleWallets) {
    return (
      <ModalMessage>
        <MultipleWalletsMessage />
      </ModalMessage>
    );
  }

  // NOTE: This doesn't happen very often
  if (!data.isConnectedToCurrentChain) {
    return (
      <ModalMessage>
        <ErrorMessage>
          Not connected to wallet. Check wallet to see if it's working.{" "}
          <ReloadLink />
        </ErrorMessage>
      </ModalMessage>
    );
  }

  // User-defined checks
  // ---

  if (expect.isConnectedToChain) {
    if (!data.chainId) {
      return (
        <ErrorMessage>
          Can't connect to network. <ReloadLink />
        </ErrorMessage>
      );
    }
  }

  if (expect.chainIds) {
    if (expect.chainIds.length === 0) {
      throw new TypeError(
        "If you want to require a set of chain acceptable ids, don't make the variable an empty array."
      );
    }
    if (!data.chainId) {
      return (
        <ModalMessage>
          Not connected to wallet. <ReloadLink />
        </ModalMessage>
      );
    }
    if (!expect.chainIds.includes(data.chainId)) {
      return (
        <ModalMessage>
          <label>Please choose a different chain:</label>
          <ChainOptions
            chainIds={expect.chainIds}
            buttonProps={{ isFullWidth: true }}
          />
        </ModalMessage>
      );
    }
  }

  if (expect.isConnected) {
    if (!data.selectedAddress) {
      const connect = () => {
        ethereum.request({ method: "eth_requestAccounts" }).catch(handleError);
      };
      return (
        <ModalMessage>
          {/* <Center h="50vh"> */}
          <VStack align="center" w="100%">
            <p>Please connect your crypto wallet to continue.</p>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={connect}
              leftIcon={<FaEthereum />}
            >
              Connect Wallet
            </Button>
          </VStack>
          {/* </Center> */}
        </ModalMessage>
      );
    }
  }

  if (expect.isNonZeroBalance) {
    const isEmpty =
      !data.selectedAddressBalance ||
      BigNumber.from(data.selectedAddressBalance).isZero();
    if (isEmpty) {
      const connect = () => {
        ethereum
          .request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          })
          .then(() => window.location.reload())
          .catch(handleError);
      };
      return (
        <ModalMessage>
          <p>Please choose an account with a non-zero balance.</p>
          <Box pt={1} />
          <Button onClick={connect}>Choose a different account</Button>
        </ModalMessage>
      );
    }
  }

  return <>{children}</>;
};
