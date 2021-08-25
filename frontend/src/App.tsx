import { HashRouter, Switch, Route, Redirect, NavLink } from "react-router-dom";
import { Compare } from "./Compare";
import { Encrypt } from "./Encrypt";
import { Layout } from "./Layout";

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

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/encrypt">
              <Encrypt />
            </Route>
            <Route path="/compare">
              <Compare />
            </Route>
            <Route path="/drop">
              <Drop />
            </Route>
            <Route path="/verify">
              <Verify />
            </Route>
            <Route path="/">
              <Redirect to="/compare" />
            </Route>
          </Switch>
        </div>
      </HashRouter>
    </Layout>
  );
}

function Drop() {
  return <h1>Drop</h1>;
}

function Verify() {
  return <h1>Verify</h1>;
}
