import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
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
    <Tabs variant="enclosed">
      <TabList>
        <Tab>Text</Tab>
        <Tab>File</Tab>
      </TabList>
      <TabPanels borderWidth={1} borderColor="gray.200">
        <TabPanel>
          <TextTab onBlobChange={onFobChange} cid={cid} />
        </TabPanel>
        <TabPanel>
          <FileTab onFileChange={onFobChange} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
