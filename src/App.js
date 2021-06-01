import { Switch, Route, Link, Redirect } from "react-router-dom";
import Drop from "./Drop";
import Verify from "./Verify";
import styles from "./App.module.css";
import { config } from "./config";

export default function App() {
  return (
    <>
      <main className={styles.pageWrapper}>
        <nav className={styles.nav}>
          <h1 className={styles.logo}>
            <Link to="/">{config.title}</Link>
          </h1>
          <div>
            <Link to="/drop">Drop</Link> <Link to="/verify">Verify</Link>
          </div>
        </nav>
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
      </main>
    </>
  );
}
