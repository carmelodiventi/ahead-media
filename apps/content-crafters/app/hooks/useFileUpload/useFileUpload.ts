import {useFetcher} from "@remix-run/react";
import {toast} from "sonner";
import {action} from "../../routes/app.ai.knowledge-base.upload";


const useFileUpload = () =>{
  const { submit, data, state, formData } = useFetcher<typeof action>();
  const isUploading = state !== "idle";

  if(data && "error" in data){
    toast.error(data.error as string)
  }

  const uploadingFiles = formData
    ?.getAll("file")
    ?.filter((value: unknown): value is File => value instanceof File)
    .map((file) => {
      const name = file.name;
      // This line is important; it will create an Object URL, which is a `blob:` URL string
      // We'll need this to render the image in the browser as it's being uploaded
      const url = URL.createObjectURL(file);
      return { name, url };
    });


  const files = (data?.files ?? []).concat(uploadingFiles ?? []);

  return {
    submit(files: File[] | null) {
      if (!files) return;
      const formData = new FormData();
      for (const file of files) formData.append("file", file);
      submit(formData, { method: "POST", encType: "multipart/form-data", action: '/ai/knowledge-base/upload'});
    },
    isUploading,
    files,
  };
}

export default useFileUpload
