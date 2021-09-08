import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { PortalProvider } from "react-portal-hook";
import { App } from "./App";
import { EthErrorFallback } from "./eth-react/Errors";
import { EthersProviderProvider } from "./eth-react/EthersProviderContext";
import { MetaMaskProvider } from "./eth-react/useMetaMaskEthereum";
import { theme } from "./generic/chakraTheme";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={EthErrorFallback}>
        <PortalProvider>
          <MetaMaskProvider reloadOnChainChanged>
            <EthersProviderProvider>
              <App />
            </EthersProviderProvider>
          </MetaMaskProvider>
        </PortalProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </StrictMode>,
  rootElement
);
