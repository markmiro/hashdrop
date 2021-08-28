import { HashRouter, Switch, Route, Redirect, NavLink } from "react-router-dom";
import { Drop } from "./pages/Drop";
import { Compare } from "./pages/Compare";
import { Encrypt } from "./pages/Encrypt";
import { Verify } from "./pages/Verify";
import { DropOld } from "./pages/DropOld";
import { ShowDrop } from "./components/ShowDrop";
import { DropCount } from "./components/DropCount";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./generic/ErrorFallback";
import { EnsureConnectionRequirements } from "./eth-react/EnsureConnectionRequirements";
import feArtifacts from "./hardhat-frontend-artifacts.json";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Global styles
    <div className="code pv4 ph2 lh-copy">
      {/* Container */}
      <div className="ml-auto mr-auto" style={{ maxWidth: "72ch" }}>
        {/* Layout */}
        <div className="flex flex-column items-stretch">{children}</div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Layout>
      {/* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md */}
      <HashRouter hashType="slash">
        <div>
          <nav className="flex justify-between bg-black-05 pa2">
            <NavLink to="/" className="no-underline black">
              <b>HASH💧</b>
            </NavLink>
            <div>
              <NavLink activeClassName="bg-black white" to="/encrypt">
                Encrypt
              </NavLink>
              {" | "}
              <NavLink activeClassName="bg-black white" to="/compare">
                Compare
              </NavLink>
              {" | "}
              <NavLink activeClassName="bg-black white" to="/drop">
                Drop
              </NavLink>
              {" | "}
              <NavLink activeClassName="bg-black white" to="/verify">
                Verify
              </NavLink>
            </div>
          </nav>

          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            <Switch>
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
                <EnsureConnectionRequirements
                  isConnected
                  isNonZeroBalance
                  chainIds={Object.keys(feArtifacts.contract.HashDrop.chainId)}
                >
                  <Drop />
                </EnsureConnectionRequirements>
              </Route>
              <Route path="/drop-old">
                <DropOld />
              </Route>
              <Route path="/verify">
                <Verify />
              </Route>
              <Route path="/">
                <Redirect to="/compare" />
              </Route>
            </Switch>
          </ErrorBoundary>
        </div>
      </HashRouter>
      <hr />
      <DropCount />
    </Layout>
  );
}
