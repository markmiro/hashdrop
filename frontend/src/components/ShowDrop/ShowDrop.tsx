import { Box, Button, VStack } from "@chakra-ui/react";
import delay from "delay";
import { useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { Cid } from "../../eth-react/Cid";
import { EthEnsure } from "../../eth-react/EthEnsure";
import { useEthersProvider } from "../../eth-react/EthersProviderContext";
import { useContract } from "../../eth-react/useContract";
import { ErrorMessage } from "../../generic/Errors/ErrorMessage";
import { Loader } from "../../generic/Loader";
import feArtifacts from "../../hardhat-frontend-artifacts.json";
import { HashDrop as T } from "../../typechain/HashDrop";
import { cidToUrl } from "../../util/pinata";
import { IFramePreview } from "../IFramePreview";
import { ShowMyPrivateDrop } from "./ShowPrivateDrop";
import { useCheckIpfsCidExists } from "./useCheckIpfsCidExists";

const goodChainIds = Object.keys(feArtifacts.contract.HashDrop.chainId).map(
  (id) => parseInt(id)
);

/** Query Ethereum network for a hash drop with a given cid */
function useEthDrop(cid: string) {
  const handleError = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [isMine, setIsMine] = useState(false);
  const [dropperAddress, setDropperAddress] = useState("");
  const [privateCid, setPrivateCid] = useState("");
  const provider = useEthersProvider();
  const hashdrop = useContract<T>("HashDrop");

  useEffect(() => {
    const doAsync = async () => {
      if (!hashdrop.contract) {
        return; // Try again
        // throw new Error("hashdrop.contract expected to be set");
      }
      setLoading(true);
      await delay(500);

      // Check if drop owner address matches connected account
      const dropperAddress = await hashdrop.contract.cidToAddress(cid);
      setDropperAddress(dropperAddress);
      const signer = provider.getSigner();
      const connectedAddress = await signer.getAddress();
      setIsMine(dropperAddress === connectedAddress);

      // Get private CID if there is one
      const privateCid = await hashdrop.contract.cidToPrivateCid(cid);
      setPrivateCid(privateCid);

      setLoading(false);
    };
    doAsync().catch((err) => {
      handleError(err);
      setLoading(false);
    });
  }, [handleError, provider, cid, hashdrop.contract]);

  return {
    loading,
    isMine,
    privateCid,
    isPrivate: !!privateCid,
    dropperAddress,
  };
}

function useConnectToAddress(address: string) {
  const provider = useEthersProvider();

  const connect = async () => {
    const addresses = await provider.send("eth_requestAccounts", []);
    console.log(addresses);
  };

  return connect;
}

function EthShow({ cid, checkAgain }: { cid: string; checkAgain: () => void }) {
  const ethDrop = useEthDrop(cid);
  const connectToAddress = useConnectToAddress(ethDrop.dropperAddress);

  return (
    <VStack spacing="2" alignItems="stretch">
      {/* <pre>{JSON.stringify(ethDrop, null, "  ")}</pre> */}
      {ethDrop.loading && <Loader>Checking Ethereum blockchain</Loader>}
      {!ethDrop.loading && (
        <>
          {process.env.NODE_ENV === "development" && (
            <div>
              <label>Private CID:</label>
              <br />
              <Cid cid={ethDrop.privateCid} />
            </div>
          )}
          {ethDrop.privateCid ? (
            <>
              {ethDrop.isMine ? (
                <ShowMyPrivateDrop cid={cid} privateCid={ethDrop.privateCid} />
              ) : (
                <ErrorMessage>
                  Private drop hasn't been published yet. If this is your drop,
                  try to log into this account: {ethDrop.dropperAddress}{" "}
                  <button onClick={connectToAddress}>Connect</button>.{" "}
                  <button onClick={checkAgain}>Check Again</button>
                </ErrorMessage>
              )}
            </>
          ) : (
            <ErrorMessage>
              Couldn't find the document.{" "}
              <Button
                colorScheme="red"
                variant="link"
                textDecoration="underline"
                onClick={checkAgain}
              >
                Try Again
              </Button>
            </ErrorMessage>
          )}
        </>
      )}
    </VStack>
  );
}

export function ShowDrop({ cid }: { cid: string }) {
  const cidChecker = useCheckIpfsCidExists(cid);

  return (
    <>
      {process.env.NODE_ENV === "development" && <Cid cid={cid} />}
      {cidChecker.state === "LOADING" && (
        <Loader>Searching IPFS for file</Loader>
      )}
      {cidChecker.state === "NOT_FOUND" && (
        <>
          <ErrorMessage>
            The file hasn't been published yet. Check back here when the author
            has published the file.{" "}
            <Button
              variant="link"
              colorScheme="red"
              textDecoration="underline"
              onClick={cidChecker.checkAgain}
            >
              Try Again
            </Button>
          </ErrorMessage>
          <EthEnsure isConnected chainIds={goodChainIds}>
            <EthShow cid={cid} checkAgain={cidChecker.checkAgain} />
          </EthEnsure>
        </>
      )}
      {cidChecker.state === "FOUND" && (
        <>
          {/* TODO: show date of decrypted file? If encrypted file shows up in
              plaintext then it's because your hashdrop was already dropped by
              someone else. */}
          <Box borderWidth={1} w="100%">
            <IFramePreview src={cidToUrl(cid)} style={{ height: "60vh" }} />
          </Box>
        </>
      )}
    </>
  );
}
