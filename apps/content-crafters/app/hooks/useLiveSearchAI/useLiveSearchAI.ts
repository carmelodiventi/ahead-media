import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import httpRequest from "../../helpers/request/request";
import to from "await-to-js";
import { QuerySerp } from "./useLiveSearchAI.types";
import { toast } from "sonner";
import { action } from "../../routes/app.documents_.$id.live-search.save";

const useLiveSearchAI = ({ id }: { id: string }) => {
  const fetcher = useFetcher<typeof action>();
  const [query, setQuery] = useState<string | null>(null);
  const [liveSearchResults, setLiveSearchResults] = useState<QuerySerp | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success === false && fetcher.data.error) {
      toast.error(fetcher.data.error);
      return;
    }
    if ("queries" in fetcher.data) {
      setLiveSearchResults(fetcher.data.queries);
    }
  }, [fetcher.data]);

  const handleQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query");
    setLiveSearchResults(null);
    setQuery(query as string);
    fetcher.submit(formData, {
      method: "post",
      action: `/app/documents/${id}/live-search/save`,
    });
  };

  const fetchLiveSearchResults = async (id: string) => {
    setLoading(true);
    const [error, response] = await to(
      httpRequest<QuerySerp & { success: boolean }>({
        method: "get",
        url: `/app/documents/${id}/live-search`,
      })
    );
    setLoading(false);
    if (error) {
      toast.error(error.message);
      console.error(error);
      return;
    }
    if (response.data.success === false) return;
    setLiveSearchResults(response.data as QuerySerp);
  };

  useEffect(() => {
    fetchLiveSearchResults(id);
  }, [id]);

  return {
    handleQuery,
    liveSearchResults,
    setLiveSearchResults,
    query,
    setQuery,
    loading
  };
};
export default useLiveSearchAI;
