import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import useWorkflowState from '../../../../hooks/useWorkflowState';
import { IconButton, Tooltip } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges, edges, nodes, onNodeChange } = useWorkflowState();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeRemove = () => {
    const edge = edges.find((edge) => edge.id === id);
    if (!edge) return;

    const targetNode = edge.target;
    const node = nodes.find((node) => node.id === targetNode);
    if (!node) return;

    const { [edge.targetHandle as string]: _, ...newInputMapping } = node.data
      .inputMapping as Record<string, string>;
    onNodeChange(targetNode, {
      ...node.data,
      inputMapping: newInputMapping,
    });
    setEdges(edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <Tooltip content="Remove connection">
          <IconButton
            radius="full"
            onClick={onEdgeRemove}
            color="gray"
            size="1"
            variant="solid"
            className="button-edge__label nodrag nopan"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <Cross1Icon />
          </IconButton>
        </Tooltip>
      </EdgeLabelRenderer>
    </>
  );
}
