import { Button, Dialog, TextArea, Text, Flex, Badge } from '@radix-ui/themes';
import React from 'react';
import { extractVariables } from '../../../utils/extractVariables';

interface PromptModalProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
  showPromptModal: boolean;
}

const PromptModal: React.FC<PromptModalProps> = ({
  prompt,
  showPromptModal,
  setShowPromptModal,
  setPrompt,
}) => {

  const onBlur = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
  };

  return (
    <Dialog.Root open={showPromptModal} onOpenChange={setShowPromptModal}>
      <Dialog.Content>
        <Dialog.Title>Edit Prompt</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Create your prompt. Prompts can help guide the behavior of a Language
          Model. Use curly brackets {} to introduce variables.
        </Dialog.Description>
        <TextArea
          cols={10}
          rows={10}
          placeholder={'Type message here.'}
          onBlur={onBlur}
        >
          {prompt}
        </TextArea>
        <Flex direction={'column'} justify="end" my="4">
          <Text size="2" mt="4">
            Prompt Variables:
            <Flex gap="2" mt="2">
              <Text size="2">Required:</Text>{' '}
              {extractVariables(prompt)?.required?.map((v) => (
                <Badge>{v}</Badge>
              ))}
            </Flex>
            <Flex gap="2" mt="2">
              <Text size="2">Optional:</Text>{' '}
              {extractVariables(prompt)?.optional?.map((v) => (
                <Badge>{v}</Badge>
              ))}
            </Flex>
          </Text>
          <Text size="2" mt="2" color={'gray'}>
            Prompt variables can be created with any chosen name inside curly
            brackets. For example, {'{name}'} will create a variable named
            "name".
          </Text>
        </Flex>

        <Dialog.Close>
          <Button>Close</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default PromptModal;
