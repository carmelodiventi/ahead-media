export const DocumentEntity = {
  '0': 'seo-blog',
  '1': 'blank',
  '2': 'ai-article-crafter',
} as const;

export enum DocumentStatus {
  'Draft' = 'Draft',
  'InProgress' = 'In Progress',
  'Completed' = 'Completed',
  'Archived' = 'Archived',
}

export interface DocumentState {
  isResearching: boolean
  onIsResearching: (isResearching: boolean) => void
}

export interface DocumentTypes {
  id: string;
  created_by: string;
  query: string;
  text: Array<{
    html: string;
    title: string;
    name: string;
  }>;
  metadata?: {
    name: string;
    initial_inputs: Record<string, string>;
    code: string;
    display_code: string;
    lang_code: string;
    lang_display: string;
    active_tab_index: number;
    last_editor_id: number;
    last_editor_name: string;
    serp_loaded: boolean;
    workflow_executed: boolean;
  };
  lastedited: number;
  dateCreated: number;
  hash: string;
  teamId: number;
  doc_status: DocumentStatus;
  assignment_status: number;
  assignment_status_desc: string;
  org_id: number;
  doc_owner: string;
  doc_owner_name: {
    first_name: string;
    last_name: string;
  };
  doc_status_date: number;
  doc_status_desc: string;
  doc_type: keyof typeof DocumentEntity;
  doc_type_desc: string | null;
  doc_target_date: number | null;
  template: string | null;
  googleDocID: string | null;
  wpDocID: string | null;
  archived: boolean;
  archived_dt: number | null;
  assigned_writer: string | null;
  last_linked: number | null;
  global_access: boolean;
  doc_preview_hash: string | null;
  admin: boolean;
}
