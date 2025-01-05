import React from 'react';
import { Box, Text, TextField } from '@radix-ui/themes';
import {RegularWorkflowStep} from '../../../../../types/Workflow.types';
import useWorkflowState from '../../../../../hooks/useWorkflowState';

interface StepNameProps {
  data: RegularWorkflowStep;
}

const StepName: React.FC<StepNameProps> = ({ data }) => {
  const { onNodeChange } = useWorkflowState();

  return (
    <Box p={'4'}>
      <Text size="2">Name:</Text>
      <TextField.Root
        type="text"
        placeholder="Name"
        className="nodrag"
        defaultValue={data.name}
        onChange={(e) =>
          onNodeChange(data.id as string, { ...data, name: e.target.value })
        }
      />
    </Box>
  );
};

export default StepName;
