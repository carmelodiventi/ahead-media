import {
  Box,
  Button,
  DataList,
  Flex,
  Grid,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Text,
  TextField,
} from "@radix-ui/themes";
import * as Label from "@radix-ui/react-label";
import { FormEvent, useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import * as fs from "node:fs";
import { LoaderFunctionArgs } from "@remix-run/node";
import { toast } from "sonner";
import { action } from "./app.ai.knowledge-base.train";
import {createSupabaseServerClient} from "../utils/supabase.server";
import useFileUpload from "../hooks/useFileUpload";
import FileUploads from "../components/knowledge-base/components/file-uploads";

export const meta = () => {
  return [
    { title: `Content Crafters | AI Knowledge Base` },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient } = createSupabaseServerClient(request);
  const { data } = await supabaseClient.auth.getUser();
  const dirPath = `./documents/${data.user?.id}`;

  const files = fs.readdirSync(dirPath).map((file) => ({
    name: file,
    url: `${dirPath}/${file}`,
  }));

  return {
    files,
  };
};

const KnowledgeBase = () => {
  const { submit, isUploading, files: uploadedFiles } = useFileUpload();
  const { files } = useLoaderData<typeof loader>();
  const { state, submit: submitForm, data } = useFetcher<typeof action>();

  const handleUploadVectors = (e: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);

    submitForm(formData, {
      method: "post",
      action: `/ai/knowledge-base/train`,
    });
  };

  useEffect(() => {
    if (data && "success" in data && data.success) {
      toast.success("Vectors uploaded successfully");
    } else if (data && "error" in data) {
      toast.error("An error occurred while uploading vectors: " + data.error);
    }
  }, [data]);

  return (
    <Flex direction="column" px={"4"}>
      <Box
        width={{
          sm: "100%",
          md: "50%",
        }}
      >
        <Heading size="5" align="left" my={"4"} weight="regular">
          Knowledge Base
        </Heading>
        <Text color="gray" size="2">
          Upload documents to add new knowledge to the AI
        </Text>
        <Separator my="4" size="4" />
        <Box>
          <Form onSubmit={handleUploadVectors}>
            <Grid>
              <Box className="relative">
                <IconButton
                  variant="ghost"
                  color="gray"
                  className="absolute top-0 right-0"
                >
                  <ReloadIcon className="h-4 w-4" />
                </IconButton>

                <Heading
                  size="3"
                  weight="medium"
                  align="left"
                  mb="4"
                >
                  Upload files
                </Heading>

                <FileUploads
                  name="files"
                  accept={{
                    "application/pdf": [".pdf", ".PDF"],
                    "text/plain": [".txt"],
                  }}
                  onChange={(files) => submit(files)}
                  isUploading={isUploading}
                />

                <Heading
                  size="3"
                  weight="medium"
                  align="left"
                  mb="4"
                >
                  Uploaded files
                </Heading>

                <Separator my="3" size="4" />

                <DataList.Root orientation="vertical">
                  {isUploading ? (
                    <Skeleton>
                      <DataList.Item>
                        <DataList.Label>Name</DataList.Label>
                        <DataList.Value>File Name...</DataList.Value>
                      </DataList.Item>
                    </Skeleton>
                  ) : null}
                  {[...uploadedFiles, ...files].map((file) => {
                    return (
                      <DataList.Item key={file.name}>
                        <DataList.Label>Name</DataList.Label>
                        <DataList.Value>{file.name}</DataList.Value>
                      </DataList.Item>
                    );
                  })}
                </DataList.Root>

                <Heading
                  size="3"
                  weight="medium"
                  align="left"
                  my="4"
                >
                  Database Parameters
                </Heading>

                <Separator my="3" size="4" />

                <Grid columns="2" gap="4" mt="4">
                  <Grid gap="2">
                    <Label.Root>Index name</Label.Root>
                    <TextField.Root
                      name="indexname"
                      defaultValue="content-crafters"
                      readOnly={true}
                      placeholder="index name"
                      disabled={isUploading}
                    />
                  </Grid>
                  <Grid gap="2">
                    <Label.Root>Namespace</Label.Root>
                    <TextField.Root
                      placeholder="namespace"
                      name={"namespace"}
                      disabled={isUploading}
                    />
                  </Grid>
                </Grid>
                <Separator my="3" size="4" />
                <Button
                  mt={"4"}
                  size="2"
                  loading={state === "submitting"}
                >
                  Upload vectors
                </Button>
              </Box>
            </Grid>
          </Form>
        </Box>
      </Box>
    </Flex>
  );
};
export default KnowledgeBase;
