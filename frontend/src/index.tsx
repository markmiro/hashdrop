import { StrictMode } from "react";
import ReactDOM from "react-dom";

import "tachyons/css/tachyons.min.css";
import "./index.css";

import { App } from "./App";
import { EthToolbar } from "./eth-react/EthToolbar";
import { EthersProviderProvider } from "./eth-react/EthersProviderContext";
import { reloadOnChainChanged } from "./eth-react/reloadOnChainChanged";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./generic/ErrorFallback";

reloadOnChainChanged();

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <EthersProviderProvider>
        <App />
      </EthersProviderProvider>
    </ErrorBoundary>
    <EthToolbar />
  </StrictMode>,
  rootElement
);
