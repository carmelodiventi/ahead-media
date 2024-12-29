import useWorkflowStore from "../../store/workflowStore";
import {useShallow} from "zustand/react/shallow";


function useWorkflowState() {
  const nodes = useWorkflowStore(useShallow((state) => state.nodes));
  const edges = useWorkflowStore(useShallow((state) => state.edges));
  const config = useWorkflowStore(useShallow((state) => state.workflowConfig));
  const onNodesChange = useWorkflowStore(useShallow((state) => state.onNodesChange));
  const onEdgesChange = useWorkflowStore(useShallow((state) => state.onEdgesChange));
  const onConnect = useWorkflowStore(useShallow((state) => state.onConnect));
  const onNodeChange = useWorkflowStore(useShallow((state) => state.onNodeChange));
  const onConfigChange = useWorkflowStore(useShallow((state) => state.onConfigChange));
  return { nodes, edges, config, onNodesChange, onEdgesChange, onConnect, onNodeChange, onConfigChange };
}

export default useWorkflowState;
