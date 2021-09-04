import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { PortalProvider } from "react-portal-hook";
import { App } from "./App";
import { EthErrorFallback } from "./eth-react/Errors";
import { EthEnsure } from "./eth-react/EthEnsure";
import { EthersProviderProvider } from "./eth-react/EthersProviderContext";
import { reloadOnChainChanged } from "./eth-react/reloadOnChainChanged";
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
              <EthEnsure isConnectedToChain>
                <App />
              </EthEnsure>
            </EthersProviderProvider>
            {/* <EthToolbar /> */}
          </MetaMaskProvider>
        </PortalProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </StrictMode>,
  rootElement
);
