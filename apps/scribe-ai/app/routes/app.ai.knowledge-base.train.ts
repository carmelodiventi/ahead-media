import { ActionFunctionArgs } from "@remix-run/node";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {createSupabaseServerClient} from "../utils/supabase.server";
import {createIndex, updateVectorDB} from "../utils/pinecone.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const { supabaseClient } = createSupabaseServerClient(request);
    const { data } = await supabaseClient.auth.getUser();
    const directoryLoader = new DirectoryLoader(`documents/${data.user?.id}`, {
      ".pdf": (path: string) => new PDFLoader(path, { splitPages: false }),
      ".txt": (path: string) => new TextLoader(path),
    });
    const namespace = formData.get("namespace") as string;
    const indexname = formData.get("indexname") as string;
    const docs = await directoryLoader.load();

    const index = await createIndex({
      indexname
    });

    await updateVectorDB({
      indexname: index.name,
      namespace,
      docs,
    });

    return Response.json({ success: true });

  } catch (error: Error | unknown) {
    return Response.json({ success: false, error: (error as Error)?.message ?? error }, { status: 500 });
  }
};
