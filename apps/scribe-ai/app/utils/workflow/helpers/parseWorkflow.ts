import {
  WorkflowConfig,
  WorkflowTemplate,
} from '../../../types/Workflow.types';

export function parseWorkflow(
  workflow: WorkflowTemplate,
  initialInputs: Record<string, any>
): WorkflowTemplate {
  // Track outputs from nodes to resolve mappings
  const nodeOutputs: Record<string, any> = {};

  // Process each node in order
  const parsedNodes = workflow.nodes.map((node) => {
    const nodeInputs: Record<string, any> = {};

    // Resolve input mappings for the node
    Object.entries(node.data.inputMapping || {}).forEach(([key, mapping]) => {
      if (mapping.startsWith('initialInput')) {
        // Mapping to an initial input
        nodeInputs[key] = resolveInitialInputValue(mapping, initialInputs);
      } else if (nodeOutputs[mapping]) {
        // Mapping to a previous node's output
        nodeInputs[key] = nodeOutputs[mapping];
      } else {
        console.warn(`Mapping failed for ${key}: ${mapping}`);
        nodeInputs[key] = null; // Handle missing dependency
      }
    });

    // Simulate the step execution to get its output
    const stepOutput = runWorkflowStep(node, nodeInputs);

    // Save the output for downstream nodes
    nodeOutputs[node.id] = stepOutput;

    // Add validated inputs and outputs back into the node
    return {
      ...node,
      data: {
        ...node.data,
        resolvedInputs: { ...nodeInputs },
        stepOutput, // Include step output for debugging or reuse
      },
    };
  });

  // Validate that all required initial inputs are present
  validateWorkflowInputs(workflow.config.inputs, initialInputs);

  return {
    ...workflow,
    nodes: parsedNodes,
  };
}


function resolveInitialInputValue(
  mapping: string,
  initialInputs: Record<string, any>
): any {
  const keys = mapping.replace('initialInput.', '').split('.');
  let value = initialInputs;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.error(`Mapping failed for ${mapping}`);
      return null; // Or throw an error
    }
  }

  return value;
}

function validateWorkflowInputs(
  inputsConfig: WorkflowConfig['inputs'],
  initialInputs: Record<string, any>
) {
  Object.entries(inputsConfig).forEach(([key, config]) => {
    if (config.required && !initialInputs[key]) {
      throw new Error(`Missing required input: ${key}`);
    }
  });
}
