import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { FileTab } from "./FileTab";
import { TextTab } from "./TextTab";

// TODO: Make this a controlled component by adding `fob` prop so it's possible for parent component to reset it.
export function DataTabs({
  onFobChange,
  cid,
}: {
  onFobChange: (fob: File | Blob | null) => void;
  cid?: string;
}) {
  return (
    <Tabs variant="solid-rounded" colorScheme="blue">
      <TabList>
        <Tab>Text</Tab>
        <Tab>File</Tab>
      </TabList>

      <Box pt={2} />
      <TabPanels>
        <TabPanel p={0}>
          <TextTab onBlobChange={onFobChange} cid={cid} />
        </TabPanel>
        <TabPanel p={0}>
          <FileTab onFileChange={onFobChange} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
