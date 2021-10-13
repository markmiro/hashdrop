import { Heading, Link, Spacer, Stack, VStack } from "@chakra-ui/react";
import { FC } from "react";
import {
  LinkProps,
  NavLink as RouterNavLink,
  useRouteMatch,
} from "react-router-dom";
import { AccountButton } from "../eth-react/AccountButton";
import { ChainOptions } from "../eth-react/ChainOptions";
import feArtifacts from "../hardhat-frontend-artifacts.json";
import { Logo } from "./Logo";

const goodChainIds = Object.keys(feArtifacts.contract.HashDrop.chainId).map(
  (id) => parseInt(id)
);

export const PageBody: FC<{ isFullWidth?: boolean }> = ({
  children,
  isFullWidth,
}) => (
  <VStack
    spacing={4}
    alignItems="stretch"
    py={[4, 6, 8]}
    px={[2, 4, 6]}
    w={isFullWidth ? "100%" : "2xl"}
    maxW="100%"
    minH="100vh"
    mx="auto"
  >
    {children}
  </VStack>
);

export const PageTitle: FC = ({ children }) => (
  <Heading fontSize="4xl" borderBottomWidth={1} borderColor="black">
    {children}
  </Heading>
);

export const NavLink: FC<LinkProps & { exact?: boolean }> = ({
  to,
  children,
  exact = true,
  ...rest
}) => {
  const match = useRouteMatch({
    path: to as string,
    exact,
    sensitive: true,
  });

  const matchProps = match
    ? {
        bg: "black",
        color: "white",
        _hover: { bg: "blackAlpha.700" },
      }
    : {};

  return (
    <Link
      as={RouterNavLink}
      to={to}
      flexShrink={0}
      px={3}
      py={1}
      textAlign="center"
      // bg="blackAlpha.100"
      rounded="full"
      fontWeight="medium"
      _hover={{ bg: "blackAlpha.300" }}
      {...rest}
      {...matchProps}
    >
      {children}
    </Link>
  );
};

export const Nav: FC = ({ children }) => (
  <Stack
    alignItems="center"
    direction={["column", "column", "column", "row"]}
    as="nav"
    spacing={[1, 1, 2]}
    px={2}
    py={2}
    borderBottomWidth={1}
  >
    <NavLink to="/">
      <Logo />
    </NavLink>

    <Stack direction={["column", "row", "row"]} as="nav" spacing={[1, 1, 2]}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <NavLink to="/debug">DEBUG</NavLink>
      )}
    </Stack>

    <Spacer />

    <ChainOptions
      buttonProps={{ size: "sm", variant: "ghost" }}
      chainIds={goodChainIds}
    />

    <AccountButton />
  </Stack>
);
