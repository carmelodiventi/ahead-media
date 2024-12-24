import {
  ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {createSupabaseServerClient} from "../utils/supabase.server";


export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { supabaseClient } = createSupabaseServerClient(request);
    const { data } = await supabaseClient.auth.getUser();
    const directory = `documents/${data.user?.id}`;

    const formData = await unstable_parseMultipartFormData(
      request,
      unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
          // Limit file upload to images
          filter({ contentType }) {
            return ["application/pdf", "text/plain"].includes(contentType);
          },
          // Store the images in the public/img folder
          directory: directory,
          // By default, `unstable_createFileUploadHandler` adds a number to the file
          // names if there's another with the same name; by disabling it, we replace
          // the old file
          avoidFileConflicts: false,
          // Use the actual filename as the final filename
          file({ filename }) {
            return filename;
          },
          // Limit the max size to 10MB
          maxPartSize: 10 * 1024 * 1024,
        }),
        unstable_createMemoryUploadHandler()
      )
    );

    const files = formData.getAll("file") as FormDataEntryValue[];
    return Response.json({
      files: files.map((file) => ({
        name: (file as File).name,
        url: `documents/${data.user?.id}`,
      })),
    });
  } catch (error) {
    return Response.json({ files: [], error });
  }
};
