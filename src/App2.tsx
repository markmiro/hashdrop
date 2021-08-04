import { HashRouter, Switch, Route, Link, Redirect } from "react-router-dom";

export default function App() {
  return (
    /* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md */
    <HashRouter hashType="slash">
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/drop">Publish</Link>
            </li>
            <li>
              <Link to="/verify">Verify</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/drop">
            <Drop />
          </Route>
          <Route path="/verify">
            <Verify />
          </Route>
          <Route path="/">
            <Redirect to="/drop" />
          </Route>
        </Switch>
      </div>
    </HashRouter>
  );
}

function Drop() {
  return <h2>Drop</h2>;
}

function Verify() {
  return <h2>Verify</h2>;
}
