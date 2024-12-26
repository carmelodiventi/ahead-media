import './index.css';
import React from 'react';
import { Toolbar, ToggleGroup, ToggleItem } from '@radix-ui/react-toolbar';
import { Separator } from '@radix-ui/themes';
import { ToolbarOptionsProps } from './Toolbar.types';

const ToolbarOptions: React.FC<ToolbarOptionsProps> = ({
  addSequentialNode,
  addForEachNode,
  onSave,
}) => {
  return (
    <Toolbar className="ToolbarRoot">
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
        <ToggleItem
          className="ToolbarToggleItem"
          value="save"
          aria-label="save"
          onClick={onSave}
        >
          Save
        </ToggleItem>
      </ToggleGroup>
    </Toolbar>
  );
};

export default ToolbarOptions;
