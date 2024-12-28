import {Edge} from "@xyflow/react";
import {WorkflowConfig, WorkflowNode} from "../../../types/Workflow.types";

export function getCandidateSources(
  nodes: WorkflowNode[],
  edges: Edge[],
  config: WorkflowConfig,
  currentNodeId: string
): string[] {
  const sources = new Set<string>();


  config.variables?.required?.forEach((v) => sources.add(`initialInputs.${v}`));
  config.variables?.optional?.forEach((v) => sources.add(`initialInputs.${v}`));

  const incomingEdges = edges.filter((e) => e.target === currentNodeId);
  incomingEdges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (sourceNode?.data) {
      const nodeName = sourceNode.data.name || sourceNode.id;
      if (sourceNode.data.outputMapping) {
        Object.keys(sourceNode.data.outputMapping).forEach((key) => {
          sources.add(`${nodeName}.${key}`);
        });
      }
    }
  });

  return Array.from(sources);
}
