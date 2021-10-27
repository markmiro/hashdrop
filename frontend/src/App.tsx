import { Box, HStack } from "@chakra-ui/react";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import { DropCount } from "./components/DropCount";
import { Nav, NavLink, PageBody, PageTitle } from "./generic/PageLayout";
import { EthErrorFallback } from "./eth-react/Errors";
import { EthEnsure } from "./eth-react/EthEnsure";
import { useMetaMaskEthereum } from "./eth-react/useMetaMaskEthereum";
import { Json } from "./generic/Json";
import feArtifacts from "./hardhat-frontend-artifacts.json";
import { Chains } from "./pages/debug/Chains";
import { Drops as DebugDrops } from "./pages/debug/drops/Drops";
import { DropTest2 } from "./pages/debug/DropTest2";
import { DropTools } from "./pages/debug/DropTools";
import { Encrypt } from "./pages/debug/Encrypt";
import { EthChains } from "./pages/debug/EthChains";
import { Ipfs, Ipfs2 } from "./pages/debug/ipfs";
import { Sink } from "./pages/debug/Sink";
import { Theme } from "./pages/debug/Theme";
import { Drop } from "./pages/Drop";
import { NotFound } from "./pages/NotFound";
import { ShowDrops } from "./pages/ShowDrops";
import { LatestDrops } from "./pages/LatestDrops";

const goodChainIds = Object.keys(feArtifacts.contract.HashDrop.chainId).map(
  (id) => parseInt(id)
);

export function App() {
  const { data } = useMetaMaskEthereum();

  return (
    <>
      {" "}
      {/* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md */}
      <HashRouter hashType="slash">
        <Nav>
          {data.selectedAddress && (
            <>
              <NavLink to="/latest">Latest Drops</NavLink>{" "}
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
            <NavLink to="/debug/chains">Chains</NavLink>
            <NavLink to="/debug/eth-chains">eth-chains</NavLink>
            <NavLink to="/debug/drop-tools">Drop Tools</NavLink>
            <NavLink to="/debug/drops">Drops</NavLink>
            <NavLink to="/debug/drop">Add Drop</NavLink>
            <NavLink to="/debug/ipfs">IPFS</NavLink>
          </HStack>
        </Route>

        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/latest">
              <PageBody>
                <PageTitle>Latest Drops</PageTitle>
                <LatestDrops />
                <DropCount />
              </PageBody>
            </Route>
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
                  <div>🚧</div>
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
                <DropTest2 />
              </PageBody>
            </Route>
            <Route path="/debug/drops">
              <PageBody isFullWidth>
                <PageTitle>Drops</PageTitle>
                <DebugDrops />
              </PageBody>
            </Route>
            <Route path="/debug/ipfs">
              <PageBody>
                <PageTitle>IPFS</PageTitle>
                <Ipfs />
                <hr />
                <PageTitle>IPFS 2</PageTitle>
                <Ipfs2 />
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
        {process.env.NODE_ENV === "development" && <Json src={data} />}
      </HashRouter>
    </>
  );
}
