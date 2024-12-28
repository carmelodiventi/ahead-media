import React, { useState, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { Text, TextField, Grid, Flex, Button } from '@radix-ui/themes';
import CustomNode from '../customNode/CustomNode';

interface OutputNodeProps extends NodeProps {
  data: {
    name: string;
    outputMapping: Record<string, string>;
    onChange: (id: string, data: any) => void;
  };
}

const OutputNode: React.FC<OutputNodeProps> = (props) => {
  const { data, id } = props;
  const [outputMapping, setOutputMapping] = useState(data.outputMapping || {});

  useEffect(() => {
    data.onChange(id, { ...data, outputMapping });
  }, [outputMapping, data, id]);

  const handleMappingChange = (target: string, source: string) => {
    setOutputMapping((prevMapping) => ({
      ...prevMapping,
      [target]: source,
    }));
  };

  const handleDeleteMapping = (target: string) => {
    setOutputMapping((prevMapping) => {
      const newMapping = { ...prevMapping };
      delete newMapping[target];
      return newMapping;
    });
  };

  return (
    <CustomNode
      data={{
        label: 'Output Node',
        description: 'Map outputs from one step to inputs for the next step',
        handles: {
          source: {
            show: true,
            connectionCount: 1,
          },
          target: {
            show: true,
            connectionCount: 1,
          },
        },
      }}
    >
      <Grid gap={'4'} align={'start'}>
        <Text size={'2'}>Output Mapping</Text>
        {Object.entries(outputMapping).map(([target, source]) => (
          <Flex key={`${id}-${target}`} gap="2" align="center">
            <TextField.Root type="text" value={target} readOnly />
            <TextField.Root
              type="text"
              value={source}
              onChange={(e) => handleMappingChange(target, e.target.value)}
            />
            <Button type="button" onClick={() => handleDeleteMapping(target)} size="2">
              Delete
            </Button>
          </Flex>
        ))}
        <Flex gap="2">
          <TextField.Root
            className={'nodrag'}
            type="text"
            placeholder="Add new output"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value !== '') {
                setOutputMapping((prevMapping) => ({
                  ...prevMapping,
                  [e.currentTarget.value]: '',
                }));
                e.currentTarget.value = '';
              }
            }}
          />
        </Flex>
      </Grid>
    </CustomNode>
  );
};

export default OutputNode;
