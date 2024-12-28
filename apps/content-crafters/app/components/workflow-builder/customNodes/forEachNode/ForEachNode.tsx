import React, {useState} from "react";
import {Handle, NodeProps, Position} from "@xyflow/react";
import {ForEachWorkflowNodeType} from "../../../../types/Workflow.types";
import {Grid, Text, TextField} from "@radix-ui/themes";
import CustomNode from "../customNode";

const ForEachNode: React.FC<NodeProps<ForEachWorkflowNodeType>> = (
  props
) => {
  const { data } = props;
  const [name, setName] = useState(data.name);
  const [source, setSource] = useState(data.for_each_config.source);
  const [field, setField] = useState(data.for_each_config.field);
  const [itemInputParameterName, setItemInputParameterName] = useState(
    data.for_each_config.item_input_parameter_name
  );

  return (
    <CustomNode
      data={{
        label: 'ForEach Step',
        description: 'Step in the workflow and is executed forEach item in the source',
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
      <Handle type="target" position={Position.Left} />
      <Grid gap={'2'} columns={'2'}>
        <Text size={'2'}>Name:</Text>
        <TextField.Root
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Text size={'2'}>Source:</Text>
        <TextField.Root
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <Text size={'2'}>Field:</Text>
        <TextField.Root
          type="text"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
        <Text size={'2'}>Input Parameter Name:</Text>
        <TextField.Root
          type="text"
          value={itemInputParameterName}
          onChange={(e) => setItemInputParameterName(e.target.value)}
        />
      </Grid>
      <Handle type="source" position={Position.Right} />
    </CustomNode>
  );
};

export default ForEachNode;
