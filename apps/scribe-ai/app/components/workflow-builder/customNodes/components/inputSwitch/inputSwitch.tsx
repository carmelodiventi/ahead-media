import React from 'react';
import { Box, Flex, Switch, Text } from '@radix-ui/themes';
import { RegularWorkflowStep } from '../../../../../types/Workflow.types';
import useWorkflowState from '../../../../../hooks/useWorkflowState';

interface InputSwitchProps {
  label: string;
  data: RegularWorkflowStep;
  checked: boolean;
  targetKey: string;
}

const InputSwitch: React.FC<InputSwitchProps> = ({
  data,
  label,
  checked,
  targetKey,
}) => {
  const { onNodeChange } = useWorkflowState();

  return (
    <Box px={'4'}>
      <Text size="2">{label}</Text>
      <Flex align="center">
        <Switch
          className="nodrag"
          checked={checked}
          onCheckedChange={(checked) =>
            onNodeChange(data.id as string, {
              ...data,
              output: checked ? 'json' : 'rawText',
              [targetKey]: checked,
            })
          }
        />
      </Flex>
    </Box>
  );
};

export default InputSwitch;
