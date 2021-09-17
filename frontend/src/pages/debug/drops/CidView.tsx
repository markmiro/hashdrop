import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { UserJson } from "../../../components/UserJson";
import { cidToUrl } from "../../../util/pinata";
import { IFramePreview } from "../../../components/IFramePreview";
import { Cid } from "../../../eth-react/Cid";
import { useDecrypter } from "../../../components/ShowDrop/useDecrypter";

export function CidView({
  cid,
  userJson,
}: {
  cid?: string | null;
  userJson?: UserJson;
}) {
  const decrypter = useDecrypter();

  if (!cid) {
    return (
      <Center
        w="100%"
        h="40vh"
        fontSize="xl"
        fontWeight="medium"
        bg="blackAlpha.100"
      >
        👈 Choose an item.
      </Center>
    );
  }

  const userDrop = userJson?.drops[cid];
  const privateCid = userDrop?.privateCid;
  if (privateCid) {
    return (
      <VStack spacing={2} alignItems="stretch">
        <Heading>{userDrop?.dropTitle}</Heading>
        <label>CID:</label>
        <Cid cid={cid} />
        <label>Private CID:</label>
        <Cid cid={privateCid} />
        <ButtonGroup>
          <Button onClick={() => decrypter.decrypt(cid, privateCid)}>
            Decrypt
          </Button>
          <Button onClick={() => alert("notarize")}>Notarize</Button>
        </ButtonGroup>
        {decrypter.dataUrl && (
          <>
            <Box borderWidth={1} w="full">
              <IFramePreview src={decrypter.dataUrl} />
            </Box>
            <Button colorScheme="green" onClick={decrypter.publish}>
              Publish
            </Button>
          </>
        )}
      </VStack>
    );
  }

  return <IFramePreview src={cidToUrl(cid)} />;
}
