import { Badge, Box, HStack, Input, Tooltip, VStack } from "@chakra-ui/react";
import { format, formatDistanceToNow } from "date-fns/esm";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { UserDrop } from "../../../components/UserJson";

const RelativeTs = ({ ts }: { ts: number }) => (
  <Tooltip label={format(new Date(ts), "PPpp")}>
    {formatDistanceToNow(new Date(ts), {
      addSuffix: true,
    })}
  </Tooltip>
);

export function DropItem({
  drop,
  editing,
  dispatch,
}: {
  drop: UserDrop;
  editing: boolean;
  dispatch: React.Dispatch<any>;
}) {
  const match = useRouteMatch<{ cid: string }>("/debug/drops/:cid");
  const isActive = match?.params.cid === drop.cid;

  return (
    <Box
      as={RouterLink}
      to={`/debug/drops/${drop.cid}`}
      px={4}
      py={2}
      borderWidth={1}
      bg={isActive ? "blackAlpha.50" : "inherit"}
      borderColor={isActive ? "black" : "inherit"}
    >
      <VStack spacing={2} align="start">
        <Box fontWeight="bold" w="100%">
          {editing ? (
            <Input
              size="sm"
              w="100%"
              value={drop.dropTitle}
              onChange={(e) =>
                dispatch({
                  type: "SET_TITLE",
                  key: drop.cid,
                  value: e.target.value,
                })
              }
              borderColor="blackAlpha.400"
              fontWeight="inherit"
              fontSize="inherit"
              lineHeight="short"
              textAlign="inherit"
            />
          ) : (
            drop.dropTitle
          )}
        </Box>
        <Badge colorScheme="green">notarized</Badge>
        <HStack spacing={1} fontSize="xs">
          <span>
            Created <RelativeTs ts={drop.created} />
          </span>
          <span>•</span>
          <span>
            Modified <RelativeTs ts={drop.modified} />
          </span>
        </HStack>
      </VStack>
    </Box>
  );
}
