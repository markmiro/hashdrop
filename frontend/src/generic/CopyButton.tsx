import { CopyIcon } from "@chakra-ui/icons";
import { Link, LinkProps, useToast } from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import React, { FC, useCallback } from "react";

export const CopyButton: FC<
  LinkProps & {
    toCopy: string;
  }
> = ({ toCopy, ...rest }) => {
  const toast = useToast();

  const handleCopy = useCallback(() => {
    copy(toCopy);
    toast({
      title: "Copied.",
      duration: 1000,
    });
  }, [toCopy, toast]);

  return (
    <Link
      as="button"
      variant="link"
      title={toCopy}
      onClick={handleCopy}
      _hover={{ opacity: "50%" }}
      transform="translate(0px, -1px)"
      {...rest}
    >
      <CopyIcon />
    </Link>
  );
};
