import {WorkflowTemplate} from "../../../types/Workflow.types";

export interface ToolbarOptionsProps {
  workflow: Partial<WorkflowTemplate>;
  addNode: () => void;
  onSave: () => void;
  isSaving: boolean;
}
