import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { PortalProvider } from "react-portal-hook";

import "./index.css";

import { App } from "./App";
import { EthToolbar } from "./eth-react/EthToolbar";
import { EthersProviderProvider } from "./eth-react/EthersProviderContext";
import { reloadOnChainChanged } from "./eth-react/reloadOnChainChanged";
import { ErrorBoundary } from "react-error-boundary";
import { EthErrorFallback } from "./eth-react/Errors";
import { MetaMaskProvider } from "./eth-react/useMetaMaskEthereum";
import { theme } from "./generic/chakraTheme";

reloadOnChainChanged();

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={EthErrorFallback}>
        <PortalProvider>
          <MetaMaskProvider>
            <EthersProviderProvider>
              <App />
            </EthersProviderProvider>
            <EthToolbar />
          </MetaMaskProvider>
        </PortalProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </StrictMode>,
  rootElement
);
