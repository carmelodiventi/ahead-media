import { DocumentTypes } from "~/content-crafters/types/Document.types";
import { FormEvent } from "react";

export interface PanelsProps {
  handleQuery: (
    e: FormEvent<HTMLFormElement>,
    document_id: string
  ) => Promise<void>;
  liveSearchResults: any;
  document: DocumentTypes;
}
