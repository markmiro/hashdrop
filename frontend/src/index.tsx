import { StrictMode } from "react";
import ReactDOM from "react-dom";

import "tachyons/css/tachyons.min.css";
import "./index.css";

import { App } from "./App";
import { EthToolbar } from "./eth-react/EthToolbar";
import { EthersProviderProvider } from "./eth-react/EthersProviderContext";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <EthersProviderProvider>
      <App />
    </EthersProviderProvider>
    <EthToolbar />
  </StrictMode>,
  rootElement
);
