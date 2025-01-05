import React, { Fragment } from 'react';
import {
  Text,
  Flex,
  Box,
  IconButton,
  DataList,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';

interface MappingEditorProps {
  label: string;
  mapping: Record<string, string>; // Current input-output mappings
  setMapping: (mapping: Record<string, string>) => void; // Update mappings
}

const MappingEditor: React.FC<MappingEditorProps> = ({
  label,
  mapping,
  setMapping,
}) => {

  const removeMapping = (variable: string) => {
    const updatedMapping = { ...mapping };
    delete updatedMapping[variable];
    setMapping(updatedMapping);
  };

  if(Object.entries(mapping).length === 0) {
    return null;
  }

  return (
    <Box px={'4'}>
      <Text size="2">{label}</Text>

      <DataList.Root size="2" my={'4'}>
        {Object.entries(mapping).map(([variable, source]) => (
          <Fragment key={variable}>
            <DataList.Item>
              <DataList.Label minWidth="88px">Name</DataList.Label>
              <DataList.Value>{variable}</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">Source</DataList.Label>
              <DataList.Value>
                <Flex align="center" justify={"between"} style={{
                  width: '100%',
                }}>
                  {source}
                  <IconButton onClick={() => removeMapping(variable)}>
                    <Cross2Icon />
                  </IconButton>
                </Flex>
              </DataList.Value>
            </DataList.Item>
          </Fragment>
        ))}
      </DataList.Root>
    </Box>
  );
};

export default MappingEditor;
