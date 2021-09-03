import {
  Badge,
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

export const PageTitle: FC = ({ children }) => <Heading>{children}</Heading>;

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
    spacing={[0, 0, "4"]}
    borderBottomWidth={1}
  >
    <NavLink to="/">
      <Text fontWeight="bold">HASH💧</Text>
    </NavLink>

    {process.env.NODE_ENV === "development" && (
      <Badge colorScheme="orange" as={RouterNavLink} to="/debug">
        DEBUG
      </Badge>
    )}

    <Spacer />
    <Stack direction={["column", "row", "row"]} as="nav" spacing={[0, 0, "4"]}>
      {children}
    </Stack>
  </Stack>
);
