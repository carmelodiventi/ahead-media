import React from 'react';
import PromptModal from '../promptModal';
import {Box, Text, TextField} from '@radix-ui/themes';
import { InputIcon } from '@radix-ui/react-icons';

const InputPrompt: React.FC<{
  label: string;
  placeholder?: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
}> = ({ label, placeholder, prompt, setPrompt }) => {
  const [showPromptModal, setShowPromptModal] = React.useState(false);

  return (
    <Box px={"4"}>
      <Text size={'2'}>{label}</Text>
      <TextField.Root
        placeholder={placeholder}
        className={'nodrag'}
        value={prompt}
        onClick={() => setShowPromptModal(!showPromptModal)}
        onChange={(e) => setPrompt(e.target.value)}
      >
        <TextField.Slot
          side={'right'}
        >
          <InputIcon />
        </TextField.Slot>
      </TextField.Root>
      <PromptModal
        prompt={prompt}
        setPrompt={setPrompt}
        showPromptModal={showPromptModal}
        setShowPromptModal={setShowPromptModal}
      />
    </Box>
  );
};

export default InputPrompt;
