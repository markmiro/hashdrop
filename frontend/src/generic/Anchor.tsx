import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import { Link, LinkProps } from "@chakra-ui/react";
import { FC } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export const Anchor: FC<
  LinkProps & RouterLinkProps & { isDisabled?: boolean }
> = ({ to, children, isDisabled, isExternal, ...rest }) => (
  <Link
    as={isExternal ? "a" : RouterLink}
    href={isExternal ? (to as string) : undefined}
    isExternal={isExternal}
    {...rest}
    style={{ ...rest.style, opacity: isDisabled ? "50%" : "" }}
  >
    {children ?? to}
    {isExternal && (
      <ExternalLinkIcon ml="1" opacity="50%" transform="translate(0px, -2px)" />
    )}
  </Link>
);
