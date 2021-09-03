import { DownloadIcon } from "@chakra-ui/icons";
import { Button, ButtonProps } from "@chakra-ui/react";
import { format } from "date-fns";
import { FC } from "react";

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd-HH_mm_ss");
}

type Props = ButtonProps & { cid?: string; text: string };

export const DownloadButton: FC<Props> = ({ cid, text, ...rest }) => {
  return (
    <Button
      as="a"
      isDisabled={!text}
      pointerEvents={text ? "all" : "none"}
      download={`${cid ?? "hashdrop-" + formatDate(new Date())}.txt`}
      href={"data:text/plain," + encodeURIComponent(text)}
      leftIcon={<DownloadIcon />}
      {...rest}
    >
      Download
    </Button>
  );
};
