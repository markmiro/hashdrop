import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";
import { DropCount } from "./components/DropCount";
import { ShowDrop } from "./components/ShowDrop/ShowDrop";
import { ChainOptions } from "./eth-react/ChainOptions";
import { EthEnsure } from "./eth-react/EthEnsure";
import { EthErrorFallback } from "./eth-react/EthErrorFallback";
import feArtifacts from "./hardhat-frontend-artifacts.json";
import { Arbitrum } from "./pages/Arbitrum";
import { Compare } from "./pages/Compare";
import { Drop } from "./pages/Drop";
import { DropOld } from "./pages/DropOld";
import { Encrypt } from "./pages/Encrypt";
import { Sink } from "./pages/Sink";

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 py-1">
      {/* Layout */}
      <div className="flex flex-col items-stretch">{children}</div>
    </div>
  );
}

const goodChainIds = Object.keys(feArtifacts.contract.HashDrop.chainId).map(
  (id) => parseInt(id)
);

export function App() {
  return (
    <>
      {/* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md */}
      <HashRouter hashType="slash">
        <nav className="z-10 px-2 sticky top-0 flex justify-between gap-3 shadow-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm">
          <NavLink to="/" className="no-underline black flex-shrink-0">
            <b>HASH💧</b>
          </NavLink>
          <div className="flex flex-wrap gap-4">
            <NavLink
              className="text-black no-underline"
              activeClassName="bg-black text-white"
              to="/sink"
            >
              Kitchen Sink
            </NavLink>
            <NavLink
              className="text-black no-underline"
              activeClassName="bg-black text-white"
              to="/encrypt"
            >
              Encrypt
            </NavLink>
            <NavLink
              className="text-black no-underline"
              activeClassName="bg-black text-white"
              to="/compare"
            >
              Compare
            </NavLink>
            <NavLink
              className="text-black no-underline"
              activeClassName="bg-black text-white"
              to="/drop-old"
            >
              Drop Old
            </NavLink>
            <NavLink
              className="text-black no-underline"
              activeClassName="bg-black text-white"
              to="/drop"
            >
              Drop
            </NavLink>
            <NavLink
              className="text-black no-underline"
              activeClassName="bg-black text-white"
              to="/arbitrum"
            >
              Arbitrum
            </NavLink>
          </div>
        </nav>

        <Body>
          <ErrorBoundary FallbackComponent={EthErrorFallback}>
            {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/sink">
                <Sink />
              </Route>
              <Route path="/encrypt">
                <Encrypt />
              </Route>
              <Route path="/compare">
                <Compare />
              </Route>
              <Route
                path="/drop/:cid"
                render={(props) => <ShowDrop cid={props.match.params.cid} />}
              ></Route>
              <Route path="/drop">
                <EthEnsure isConnected isNonZeroBalance chainIds={goodChainIds}>
                  <Drop />
                </EthEnsure>
              </Route>
              <Route path="/drop-old">
                <DropOld />
              </Route>
              <Route path="/arbitrum">
                <Arbitrum />
              </Route>
              <Route path="/">
                <Redirect to="/compare" />
              </Route>
            </Switch>
          </ErrorBoundary>
          <hr />
          <EthEnsure chainIds={goodChainIds}>
            <DropCount />
          </EthEnsure>
          <ChainOptions chainIds={goodChainIds} />
        </Body>
      </HashRouter>
    </>
  );
}
