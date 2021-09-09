import { Box, Button, HStack, Link, Spacer } from "@chakra-ui/react";
import { ErrorBoundary } from "react-error-boundary";
import ReactJson from "react-json-view";
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
  Link as RouterLink,
} from "react-router-dom";
import { DropCount } from "./components/DropCount";
import { Nav, NavLink, PageBody, PageTitle } from "./components/PageLayout";
import { ShowDrop } from "./components/ShowDrop/ShowDrop";
import { EthErrorFallback } from "./eth-react/Errors";
import { EthEnsure } from "./eth-react/EthEnsure";
import { useMetaMaskEthereum } from "./eth-react/useMetaMaskEthereum";
import feArtifacts from "./hardhat-frontend-artifacts.json";
import { Chains } from "./pages/debug/Chains";
import { Drop } from "./pages/Drop";
import { DropOld } from "./pages/debug/DropOld";
import { DropTest as DropTest } from "./pages/debug/DropTest";
import { Encrypt } from "./pages/debug/Encrypt";
import { EthChains } from "./pages/debug/EthChains";
import { NotFound } from "./pages/NotFound";
import { ShowDrops } from "./pages/ShowDrops";
import { DropsTest } from "./pages/debug/DropsTest";
import { Sink } from "./pages/debug/Sink";
import { Theme } from "./pages/debug/Theme";
import { AddIcon } from "@chakra-ui/icons";
import { DropTools } from "./pages/debug/DropTools";

const goodChainIds = Object.keys(feArtifacts.contract.HashDrop.chainId).map(
  (id) => parseInt(id)
);

export function App() {
  const { data } = useMetaMaskEthereum();

  return (
    <>
      {/* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md */}
      <HashRouter hashType="slash">
        <Nav>
          {data.selectedAddress && (
            <>
              <NavLink to="/drop">Add Drop</NavLink>{" "}
              <NavLink to="/drops">Your Drops</NavLink>
            </>
          )}
        </Nav>

        <Route path="/debug">
          <HStack borderBottomWidth={1} overflow="scroll" w="full">
            {/* <NavLink to="/debug">Debug</NavLink> */}
            <NavLink to="/debug/theme">Theme</NavLink>
            <NavLink to="/debug/sink">Kitchen Sink</NavLink>
            <NavLink to="/debug/encrypt">Encrypt</NavLink>
            <NavLink to="/debug/drop-old">Drop Old</NavLink>
            <NavLink to="/debug/chains">Chains</NavLink>
            <NavLink to="/debug/eth-chains">eth-chains</NavLink>
            <NavLink to="/debug/drop-tools">Drop Tools</NavLink>
            <NavLink to="/debug/drops">Drops</NavLink>
            <NavLink to="/debug/drop">Add Drop</NavLink>
          </HStack>
        </Route>

        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/drops">
              <PageBody>
                <PageTitle>Your Drops</PageTitle>
                <ShowDrops />
                <DropCount />
              </PageBody>
            </Route>
            <Route
              path="/drop/:cid"
              render={(props) => (
                <PageBody>
                  <PageTitle>Show Drop</PageTitle>
                  <ShowDrop cid={props.match.params.cid} />
                </PageBody>
              )}
            />
            <Route path="/drop">
              <PageBody>
                <EthEnsure isConnected isNonZeroBalance chainIds={goodChainIds}>
                  <PageTitle>Drop a hash</PageTitle>
                  <Drop />
                </EthEnsure>
              </PageBody>
            </Route>

            <Route path="/debug/sink">
              <PageBody isFullWidth>
                <PageTitle>Kitchen Sink</PageTitle>
                <Sink />
              </PageBody>
            </Route>
            <Route path="/debug/theme">
              <PageBody>
                <PageTitle>Theme</PageTitle>
                <Theme />
              </PageBody>
            </Route>
            <Route path="/debug/drop-old">
              <PageBody>
                <PageTitle>Drop Old</PageTitle>
                <DropOld />
              </PageBody>
            </Route>
            <Route path="/debug/encrypt">
              <PageBody>
                <PageTitle>Encrypt</PageTitle>
                <Encrypt />
              </PageBody>
            </Route>
            <Route path="/debug/chains">
              <PageBody>
                <PageTitle>Chains</PageTitle>
                <Chains />
              </PageBody>
            </Route>
            <Route path="/debug/eth-chains">
              <PageBody>
                <PageTitle>eth-chains</PageTitle>
                <EthChains />
              </PageBody>
            </Route>
            <Route path="/debug/drop-tools">
              <PageBody>
                <PageTitle>Drop Tools</PageTitle>
                <DropTools />
              </PageBody>
            </Route>
            <Route path="/debug/drop">
              <PageBody>
                <PageTitle>Add Drop</PageTitle>
                <DropTest />
              </PageBody>
            </Route>
            <Route path="/debug/drops">
              <PageBody>
                <PageTitle>
                  <HStack>
                    <div>Drops</div>
                    <Spacer />
                    <Button
                      as={RouterLink}
                      to="/debug/drop"
                      leftIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </HStack>
                </PageTitle>
                <DropsTest />
              </PageBody>
            </Route>
            <Route path="/debug"></Route>

            <Route exact path="/">
              <Redirect to="/drop" />
            </Route>

            <Route path="*">
              <PageBody>
                <NotFound />
              </PageBody>
            </Route>
          </Switch>
        </ErrorBoundary>
        <Box borderTopWidth={1} py={6} px={2} textAlign="center">
          hash💧
        </Box>
        {process.env.NODE_ENV === "development" && <ReactJson src={data} />}
      </HashRouter>
    </>
  );
}
