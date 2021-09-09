import {
  Center,
  ChakraProvider,
  Divider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { detect } from "detect-browser";
import _ from "lodash";
import { FC, StrictMode } from "react";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { PortalProvider } from "react-portal-hook";
import { App } from "./App";
import { Logo } from "./components/Logo";
import { EthErrorFallback } from "./eth-react/Errors";
import { EthersProviderProvider } from "./eth-react/EthersProviderContext";
import { MetaMaskProvider } from "./eth-react/useMetaMaskEthereum";
import { theme } from "./generic/chakraTheme";
import { ErrorMessage } from "./generic/Errors/ErrorMessage";

const browser = detect();
const EnsureRightBrowser: FC = ({ children }) => {
  switch (browser && browser.name) {
    case "chrome":
    case "firefox":
    case "edge":
      return <>{children}</>;
    default:
      return (
        <Center position="fixed" w="100%" h="100vh" top={0} left={0}>
          <VStack spacing={2} textAlign="center">
            <Logo />
            <Divider />
            <ErrorMessage>
              <Text fontSize="xl" fontWeight="medium">
                Browser not supported.
              </Text>
            </ErrorMessage>

            <div>
              <Text>Please use: Brave, Google Chrome, Firefox, or Edge.</Text>
              <Text fontSize="xs" opacity={0.5}>
                You're using{" "}
                {_.capitalize((browser && browser.name) || "unknown")}.
              </Text>
            </div>
          </VStack>
        </Center>
      );
  }
};

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={EthErrorFallback}>
        <PortalProvider>
          <EnsureRightBrowser>
            <MetaMaskProvider reloadOnChainChanged>
              <EthersProviderProvider>
                <App />
              </EthersProviderProvider>
            </MetaMaskProvider>
          </EnsureRightBrowser>
        </PortalProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </StrictMode>,
  rootElement
);
