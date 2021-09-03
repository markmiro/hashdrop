import { Box, Image, ScaleFade } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IFramePreview } from "../IFramePreview";

// RESOURCES
// ---
// MIME Types:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// Data URIs:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs

export function FilePreview({
  file,
  dataUrl,
}: {
  file: File | Blob | null;
  dataUrl: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Clear preview when file changes
  useEffect(() => {
    if (file === null && previewRef && previewRef.current) {
      previewRef.current.src = "";
      setLoaded(false);
    }
  }, [file, previewRef]);

  if (!file) return null;

  if (!file.type || !dataUrl) {
    return (
      <Box
        p={2}
        textAlign="center"
        fontWeight="medium"
        w="100%"
        fontSize="xxx-large"
      >
        📄
      </Box>
    );
  }

  const isFileImage = file.type.includes("image");
  if (isFileImage) {
    return (
      <ScaleFade initialScale={1.1} in={loaded}>
        <Image
          boxSize="sm"
          objectFit="contain"
          margin="auto"
          src={dataUrl}
          onLoad={() => setLoaded(true)}
          opacity={loaded ? 1 : 0}
          alt="uploaded"
        />
      </ScaleFade>
    );
  }

  return <IFramePreview src={dataUrl} />;
}
