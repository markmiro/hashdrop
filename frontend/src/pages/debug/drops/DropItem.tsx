import { Badge, Box, HStack, Input, Tooltip, VStack } from "@chakra-ui/react";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns/esm";
import { useEffect, useState } from "react";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { UserDrop } from "../../../util/UserJson";
import { Loader } from "../../../generic/Loader";
import { cidToUrl } from "../../../util/pinata";

const RelativeTs = ({ ts }: { ts: number }) => (
  <Tooltip label={format(new Date(ts), "PPpp")}>
    {formatDistanceToNow(new Date(ts), {
      addSuffix: true,
    })}
  </Tooltip>
);

type DropStatus = "LOADING" | "PRIVATE" | "NOT_FOUND" | "DROPPED";
function IsDropped({ drop }: { drop: UserDrop }) {
  const [dropStatus, setDropStatus] = useState<DropStatus>("LOADING");

  useEffect(() => {
    setDropStatus("LOADING");
    // Check if item is found on the restricted IPFS gateway
    axios
      .get(cidToUrl(drop.cid))
      .then((res) => {
        setDropStatus("DROPPED");
      })
      .catch((err) => {
        if (drop.privateCid) {
          axios
            .get(cidToUrl(drop.privateCid))
            .then((res) => {
              setDropStatus("PRIVATE");
            })
            .catch(() => {
              setDropStatus("NOT_FOUND");
            });
        } else {
          setDropStatus("NOT_FOUND");
        }
      });
  }, []);

  switch (dropStatus) {
    case "DROPPED":
      return <Badge colorScheme="green">dropped</Badge>;
    case "NOT_FOUND":
      return <Badge colorScheme="red">not found</Badge>;
    case "PRIVATE":
      return <Badge colorScheme="orange">private</Badge>;
    case "LOADING":
    default:
      return (
        <Badge variant="outline">
          <Loader>looking</Loader>
        </Badge>
      );
  }
}

export function DropItem({
  drop,
  editing,
  onSetTitle,
}: {
  drop: UserDrop;
  editing: boolean;
  onSetTitle: (title: string) => void;
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
              onChange={(e) => onSetTitle(e.target.value)}
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
        <HStack spacing={1}>
          {/* <Badge colorScheme="green">notarized</Badge> */}
          <IsDropped drop={drop} />
        </HStack>
        <HStack spacing={1} fontSize="xs">
          <span>
            Created <RelativeTs ts={drop.created} />
          </span>
          {drop.modified && (
            <>
              <span>•</span>
              <span>
                Modified <RelativeTs ts={drop.modified} />
              </span>
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
