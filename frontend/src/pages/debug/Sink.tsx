import {
  Box,
  Button,
  Grid,
  GridItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EditableExample } from "../../components/debug/EditableExample";
import { DropCount } from "../../components/DropCount";
import { AddressLink } from "../../eth-react/AddressLink";
import { ChainOptions } from "../../eth-react/ChainOptions";
import { chainIds } from "../../eth-react/chains";
import { Cid } from "../../eth-react/Cid";
import {
  EthErrorFallback,
  InstallMetaMaskMessage,
  NonceErrorMessage,
  MultipleWalletsMessage,
} from "../../eth-react/Errors";
import { EthEnsure } from "../../eth-react/EthEnsure";
import { MetaMaskOverlay } from "../../eth-react/MetaMaskOverlay";
import { ErrorMessage } from "../../generic/Errors/ErrorMessage";
import { GenericError } from "../../generic/Errors/GenericError";
import { Loader } from "../../generic/Loader";

const KitchenItems: FC = ({ children }) => (
  <Grid
    templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)", "repeat(3, 1fr)"]}
    gap={4}
  >
    {children}
  </Grid>
);

const Item: FC<{ title: ReactNode }> = ({ title, children }) => (
  <>
    <GridItem colSpan={1} borderTop="1px" borderColor="blackAlpha.300" py="4">
      <Text fontWeight="bold" fontSize="xl">
        &lt;{title}&gt;
      </Text>
    </GridItem>
    <GridItem colSpan={2} borderTop="1px" borderColor="blackAlpha.300" py="4">
      <VStack alignItems="start">{children}</VStack>
    </GridItem>
  </>
);

function TabExample() {
  return (
    <Tabs>
      <TabList>
        <Tab>One</Tab>
        <Tab>Two</Tab>
        <Tab>Three</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <p>one!</p>
        </TabPanel>
        <TabPanel>
          <p>two!</p>
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

function MetaMaskExample() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>Open</Button>
      <MetaMaskOverlay isOpen={isOpen} onClose={onClose}>
        <Button size="xs" onClick={onClose}>
          Cancel
        </Button>
      </MetaMaskOverlay>
    </>
  );
}

export function Sink() {
  return (
    <KitchenItems>
      <Item title="Editable">
        <EditableExample />
      </Item>
      <Item title="MetaMaskOverlay">
        <MetaMaskExample />
      </Item>
      <Item title="Button variant='link'">
        <Button variant="link">Hello</Button>
      </Item>
      <Item title="Tabs">
        <TabExample />
      </Item>
      <Item title="Loader">
        <Loader>Lorem ipsum</Loader>
      </Item>
      <Item title="ChainOptions">
        <ChainOptions chainIds={Object.values(chainIds)} />
      </Item>
      <Item title="Cid">
        <Cid />
        <Cid cid="bafkreigrzc22o6la4hvhotxvvqmul4juiydhtotyhr4oz2skercvcjbvwq" />
      </Item>
      <Item title="AddressLink">
        <AddressLink address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" />
        <AddressLink address="0xeF0Aa769717A29Cc5E094886b85dF35CCfA4e3ad" />
        <AddressLink />
      </Item>
      <Item title="DropCount">
        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          <DropCount />
        </ErrorBoundary>
      </Item>
      <Item title="GenericError">
        <GenericError />
        <GenericError tryAgain={() => alert("tryAgain() called")} />
        <GenericError tryAgain={() => alert("tryAgain() called")}>
          Sample Error
        </GenericError>
        <Box fontSize="xl">
          <GenericError tryAgain={() => alert("tryAgain() called")}>
            Sample Error
          </GenericError>
        </Box>
      </Item>
      <Item title="InstallMetaMaskMessage">
        <InstallMetaMaskMessage />
      </Item>
      <Item title="MultipleWalletsMessage">
        <MultipleWalletsMessage />
      </Item>
      <Item title="NonceErrorMessage">
        <ErrorMessage>
          <NonceErrorMessage originalMessage={"LOREM IPSUM"} />
        </ErrorMessage>
      </Item>
      <Item title="ErrorMessage">
        <ErrorMessage>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic beatae in
          illo, neque iure architecto explicabo voluptate labore a iste placeat
          qui quis soluta accusamus reiciendis quaerat quasi dolor. Consequatur.
        </ErrorMessage>
      </Item>
      <Item title="EthErrorFallback">
        <EthErrorFallback
          error={new Error("Lorem ipsum")}
          resetErrorBoundary={() => alert("resetErrorBoundary()")}
        />
      </Item>
      <Item title="EthEnsure">
        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          <EthEnsure isConnected>Is Connected</EthEnsure>
          {/* <EthEnsure chainIds={[1234]}>Is Connected</EthEnsure> */}
        </ErrorBoundary>
      </Item>
    </KitchenItems>
  );
}
