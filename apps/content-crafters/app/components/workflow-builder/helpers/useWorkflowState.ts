import { useWorkflowStore } from '../../../store/workflowStore';

export function useWorkflowState() {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const config = useWorkflowStore((state) => state.workflowConfig);
  return { nodes, edges, config };
}
