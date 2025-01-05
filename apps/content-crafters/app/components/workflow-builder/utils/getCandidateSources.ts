import { WorkflowNode } from '../../../types/Workflow.types';
import { Edge } from '@xyflow/react';

export const getCandidateSources = (
  nodes: WorkflowNode[],
  edges: Edge[], // Workflow edges
  currentNodeId: string
): { nodeId: string; key: string; type: string }[] => {
  const candidateSources: { nodeId: string; key: string; type: string }[] = [];

  if (!Array.isArray(edges)) {
    console.error('Edges is not an array:', edges);
    return [];
  }

  // Identify incoming edges
  const incomingEdges = edges.filter((edge) => edge.target === currentNodeId);

  // Find source nodes and extract metadata
  incomingEdges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    if (sourceNode && sourceNode.data.outputMetadata) {
      const { keys, type } = sourceNode.data.outputMetadata;
      keys.forEach((key) => {
        candidateSources.push({ nodeId: edge.source, key, type });
      });
    }
  });

  return candidateSources;
};
