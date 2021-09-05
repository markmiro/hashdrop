import { Box, Button, HStack, Spacer, Textarea } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConfirm } from "../../generic/Confirm";
import { fobAsText } from "../../util/fobAsText";
import { textToBlob } from "../../util/textToBlob";
import { textTypes } from "../../util/textTypes";
import { FileInput } from "../FileInput";
import _ from "lodash";

export function TextTab({
  onBlobChange,
  cid,
}: {
  cid?: string;
  onBlobChange: (blob: Blob | null) => void;
}) {
  const confirm = useConfirm();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [fob, setFob] = useState<File | Blob | null>(null);

  // Calculate the fob based on the text
  const createBlob = useCallback(
    _.debounce((text: string) => {
      if (text) {
        const blob = textToBlob(text);
        setFob(blob);
      } else {
        setFob(null);
      }
    }, 200),
    []
  );

  const updateText = useCallback(
    async (text) => {
      setText(text);
      createBlob(text);
    },
    [createBlob]
  );

  const resetText = () => {
    setText("");
    setFob(null);
    setTimeout(() => textRef.current?.focus(), 200);
  };

  const updateTextFile = useCallback(async (file: File | Blob | null) => {
    if (!file) return;
    if (textTypes.includes(file.type)) {
      const text = await fobAsText(file);
      setText(text);
    } else {
      setText("");
    }
    setFob(file);
  }, []);

  useEffect(() => {
    if (!text) setFob(null);
  }, [text]);

  useEffect(() => {
    onBlobChange(fob);
  }, [onBlobChange, fob]);

  return (
    <div>
      <Textarea
        ref={textRef}
        autoFocus
        placeholder="Type here..."
        style={{ height: "20vh" }}
        value={text}
        onChange={(e) => updateText(e.target.value)}
      />
      <Box pt={2} />
      <HStack alignItems="center" spacing={2}>
        <FileInput
          label="Open File"
          acceptTypes={textTypes}
          file={fob instanceof File ? fob : null}
          keepFile={!!text}
          buttonProps={{
            size: "sm",
            isDisabled: !!text,
            pointerEvents: !!text ? "none" : undefined,
          }}
          onFileChange={updateTextFile}
        />
        <Spacer />
        {/* <DownloadButton cid={cid} text={text} flex="0 0 auto" /> */}
        <Button
          size="sm"
          onClick={() =>
            confirm(resetText, {
              title: "Are you sure you want to clear the text?",
            })
          }
          isDisabled={!text}
          flex="0 0 auto"
        >
          Clear
        </Button>
      </HStack>
    </div>
  );
}
