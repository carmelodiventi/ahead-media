import React, { Fragment } from 'react';
import { Text, Flex, Box, IconButton, DataList } from '@radix-ui/themes';
import { Cross2Icon, RowSpacingIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';

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
  const [open, setOpen] = React.useState(false);
  const removeMapping = (variable: string) => {
    const updatedMapping = { ...mapping };
    delete updatedMapping[variable];
    setMapping(updatedMapping);
  };

  if (Object.entries(mapping).length === 0) {
    return null;
  }

  return (
    <Box px={'4'}>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Flex
          align="center"
          justify="between"
          gap="4"
          style={{ width: '100%' }}
        >
          <Text size="2">{label}</Text>
          <Collapsible.Trigger asChild>
            <IconButton radius={"full"} color={"gray"} variant={"ghost"}>
              {open ? <Cross2Icon /> : <RowSpacingIcon />}
            </IconButton>
          </Collapsible.Trigger>
        </Flex>

        <Collapsible.Content>
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
                    <Flex
                      align="center"
                      justify={'between'}
                      gap="4"
                      style={{
                        width: '100%',
                      }}
                    >
                      <Text truncate={true} wrap={'pretty'}>
                        {source}
                      </Text>
                      <IconButton
                        radius={'full'}
                        size={'1'}
                        color={'gray'}
                        variant={'ghost'}
                        onClick={() => removeMapping(variable)}
                      >
                        <Cross2Icon />
                      </IconButton>
                    </Flex>
                  </DataList.Value>
                </DataList.Item>
              </Fragment>
            ))}
          </DataList.Root>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default MappingEditor;
