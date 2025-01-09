import './index.css';
import React from 'react';
import { Toolbar, ToggleGroup, ToggleItem } from '@radix-ui/react-toolbar';
import {Button, Heading, Separator} from '@radix-ui/themes';
import { ToolbarOptionsProps } from './Toolbar.types';

const ToolbarOptions: React.FC<ToolbarOptionsProps> = ({
  workflow,
  addSequentialNode,
  addForEachNode,
  onSave,
  isSaving,
}) => {
  return (
    <Toolbar className="ToolbarRoot">
      <Heading as={'h3'} size={'3'}>
        {workflow.name}
      </Heading>
      <Separator className="ToolbarSeparator" orientation={'vertical'} />
      <ToggleGroup type="multiple">
        <ToggleItem
          className="ToolbarToggleItem"
          value="addSequentialNode"
          aria-label="addSequentialNode"
          onClick={addSequentialNode}
        >
          Add Sequential Step
        </ToggleItem>
        <Separator className="ToolbarSeparator" orientation={'vertical'} />
        <ToggleItem
          className="ToolbarToggleItem"
          value="addForEachNode"
          aria-label="addForEachNode"
          onClick={addForEachNode}
        >
          Add ForEach Step
        </ToggleItem>
        <Separator className="ToolbarSeparator" orientation={'vertical'} />
        <Button
          variant="ghost"
          loading={isSaving}
          value="save"
          aria-label="save"
          onClick={onSave}
        >
          Save
        </Button>
      </ToggleGroup>
    </Toolbar>
  );
};

export default ToolbarOptions;
