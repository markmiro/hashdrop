import {
  Badge,
  Box,
  Heading,
  Link,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FC } from "react";
import {
  LinkProps,
  useRouteMatch,
  NavLink as RouterNavLink,
} from "react-router-dom";
import { ChainOptions } from "../eth-react/ChainOptions";
import feArtifacts from "../hardhat-frontend-artifacts.json";

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
    mx="auto"
  >
    {children}
  </VStack>
);

export const PageTitle: FC = ({ children }) => (
  <Heading fontSize="6xl" borderBottomWidth={1} borderColor="black">
    {children}
  </Heading>
);

export const NavLink: FC<LinkProps> = ({ to, children, ...rest }) => {
  const match = useRouteMatch({
    path: to as string,
    exact: true,
    sensitive: true,
  });

  return (
    <Link
      as={RouterNavLink}
      to={to}
      px="5"
      py="3"
      bg={match ? "blackAlpha.100" : "transparent"}
      flexShrink={0}
      {...rest}
    >
      {children}
    </Link>
  );
};

export const Nav: FC = ({ children }) => (
  <Stack
    alignItems="center"
    direction={["column", "column", "row"]}
    as="nav"
    spacing={[0, 0, 2]}
  >
    <NavLink to="/">
      <Text fontWeight="bold">#💧</Text>
    </NavLink>

    {process.env.NODE_ENV === "development" && (
      <Badge colorScheme="orange" as={RouterNavLink} to="/debug">
        DEBUG
      </Badge>
    )}

    <Spacer />

    <Box w="sm">
      <ChainOptions buttonProps={{ size: "sm" }} chainIds={goodChainIds} />
    </Box>

    <Stack direction={["column", "row", "row"]} as="nav" spacing={[0, 0, 2]}>
      {children}
    </Stack>
  </Stack>
);
