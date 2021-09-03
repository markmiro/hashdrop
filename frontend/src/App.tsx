import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import { ShowDrop } from "./components/ShowDrop/ShowDrop";
import { EthEnsure } from "./eth-react/EthEnsure";
import { EthErrorFallback } from "./eth-react/Errors";
import feArtifacts from "./hardhat-frontend-artifacts.json";
import { Nav, NavLink, PageBody, PageTitle } from "./components/PageLayout";
import { Arbitrum } from "./pages/Arbitrum";
import { Drop } from "./pages/Drop";
import { DropOld } from "./pages/DropOld";
import { Encrypt } from "./pages/Encrypt";
import { Sink } from "./pages/Sink";
import { Box, HStack } from "@chakra-ui/react";

const goodChainIds = Object.keys(feArtifacts.contract.HashDrop.chainId).map(
  (id) => parseInt(id)
);

export function App() {
  return (
    <>
      {/* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md */}
      <HashRouter hashType="slash">
        <Nav>
          <NavLink to="/drop">Drop</NavLink>
        </Nav>

        <Route path="/debug">
          <HStack borderBottomWidth={1} overflow="scroll" w="full">
            <NavLink to="/debug">Debug</NavLink>
            <NavLink to="/debug/sink">Kitchen Sink</NavLink>
            <NavLink to="/debug/encrypt">Encrypt</NavLink>
            <NavLink to="/debug/drop-old">Drop Old</NavLink>
            <NavLink to="/debug/arbitrum">Arbitrum</NavLink>
          </HStack>
        </Route>

        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
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
                <PageTitle>Drop</PageTitle>
                <EthEnsure isConnected isNonZeroBalance chainIds={goodChainIds}>
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
            <Route path="/debug/arbitrum">
              <PageBody>
                <PageTitle>Arbitrum</PageTitle>
                <Arbitrum />
              </PageBody>
            </Route>
            <Route path="/debug"></Route>

            <Route path="/">
              <Redirect to="/drop" />
            </Route>
          </Switch>
        </ErrorBoundary>
      </HashRouter>
    </>
  );
}
