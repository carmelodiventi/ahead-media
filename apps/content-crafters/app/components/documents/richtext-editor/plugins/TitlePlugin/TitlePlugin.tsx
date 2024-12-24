import { useFetcher } from "@remix-run/react";
import './TitlePlugin.styles.css'
import type {DocumentTypes} from "../../../../../types/Document.types";
import {action} from "../../../../../routes/_app.app.documents_.$id";
import {debounce} from "../../../../../utils/debounce";

const TitlePlugin = ({ document }: { document: DocumentTypes }) => {

  const fetcher = useFetcher<typeof action>();
  const handleEditorChange = debounce((value: string) => {
    const formData = new FormData();
    formData.append("name", value);
    fetcher.submit(formData, {
      method: "post",
      action: `/app/documents/${document.id}`,
    });
  }, 300);

  return (
    <textarea
      name="name"
      placeholder="Document title"
      className="TextAreaTitle"
      onBlur={(e) => {
        handleEditorChange(e.target.value);
      }}
      defaultValue={document?.metadata?.name}
    />
  );
};
export default TitlePlugin;
