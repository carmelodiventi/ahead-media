import {WorkflowTemplate} from "../../../types/Workflow.types";

export interface ToolbarOptionsProps {
  workflow: Pick<WorkflowTemplate, 'id' | 'name' | 'config'>;
  addSequentialNode: () => void;
  addForEachNode: () => void;
  onSave: () => void;
  isSaving: boolean;
}
