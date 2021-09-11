import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import {
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  HStack,
  IconButton,
  useEditableControls,
} from "@chakra-ui/react";

function CustomControlsExample() {
  /* Here's a custom control */
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup size="sm">
        <IconButton
          aria-label=""
          icon={<CheckIcon />}
          {...getSubmitButtonProps()}
        />
        <IconButton
          aria-label=""
          icon={<CloseIcon />}
          {...getCancelButtonProps()}
        />
      </ButtonGroup>
    ) : (
      <Flex>
        <IconButton
          aria-label=""
          size="sm"
          icon={<EditIcon />}
          {...getEditButtonProps()}
        />
      </Flex>
    );
  }

  return (
    <Editable defaultValue="Rasengan ⚡️" isPreviewFocusable={true}>
      <HStack spacing={2}>
        <EditablePreview _hover={{ boxShadow: "outline" }} />
        <EditableInput />
        <EditableControls />
      </HStack>
    </Editable>
  );
}

export function EditableExample() {
  return <CustomControlsExample />;
}
