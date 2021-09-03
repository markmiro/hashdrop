import { Button, Flex, Text, VStack } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { Cid } from "../eth-react/Cid";
import { pinFile } from "../util/pinata";

export function UploadToIpfsButton({
  fob,
  onUpload,
  children,
}: {
  fob: File | Blob | null;
  onUpload?: (cid: string) => void;
  children: ReactNode;
}) {
  const [remoteCid, setRemoteCid] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitPinataUpload() {
    if (!fob) {
      alert("Please add a file or some text to submit.");
      return;
    }
    setIsLoading(true);
    // const file = new Blob([str], { type: "plain" });
    // const remoteHash = await pinFile(apiKey, apiSecret, fob);
    try {
      const cid = await pinFile(fob, { name: "test-upload" });
      setRemoteCid(cid);
      onUpload && onUpload(cid);
    } catch (err) {
      alert("Error uploading file");
    }
    setIsLoading(false);
  }

  return (
    <VStack>
      <Button
        isFullWidth
        colorScheme="blue"
        onClick={submitPinataUpload}
        isLoading={isLoading}
      >
        <Flex direction="column">
          <div>{children}</div>
          <Text fontSize="xs" fontWeight="normal" opacity="50%">
            (from above section)
          </Text>
        </Flex>
      </Button>
      <label>
        Remote CID: <Cid cid={remoteCid} />
      </label>
    </VStack>
  );
}
