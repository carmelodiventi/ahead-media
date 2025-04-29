import LiveSearch from "./components/live-search";
import {PanelsProps} from "./Panels.types";
import Events from "./components/events";

const Panels = ({ document, liveSearchResults, handleQuery }: PanelsProps) => {
  return (
    <Events doc_hash={document.id}>
      <LiveSearch
        liveSearchResults={liveSearchResults}
        searchQuery={document.query}
        document={document}
      />
    </Events>
  );
};

export default Panels;
