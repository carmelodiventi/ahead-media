import { useCallback, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import * as Label from "@radix-ui/react-label";
import { UploadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

export interface MediaUploadState {
  progress: number;
  file?: File;
  error?: string;
}

interface Props {
  label?: string;
  name: string;
  defaultValue?: string | null;
  helpText?: string;
  accept?: Accept;
  onChange: (value: File[]) => void;
  isUploading: boolean;
}

const MAX_SIZE = 2097152;

export default function FileUploads({ name, label, onChange, accept }: Props) {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const onDropAccepted = useCallback(
    (file: File[]) => {
      setCurrentFile(file[0]);
      return onChange(file);
    },
    [onChange]
  );

  const onDropRejected = (fileRejected: FileRejection[]) => {
    fileRejected.forEach(({ errors }) => {
      errors.forEach(({ code, message }) => {
        if (code === "file-too-large") {
          toast.error(message);
        }

        if (code === "file-invalid-type") {
          toast.error(message);
        }
      });
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected,
    onDropAccepted,
    accept: accept,
    multiple: false,
    maxSize: MAX_SIZE,
    maxFiles: 0,
  });

  return (
    <Box>
      <Flex direction="column" align="baseline" justify="between" mb="1">
        <Box className="w-48">
          <Label.Root htmlFor={name}>{label}</Label.Root>
        </Box>
        <Flex className="py-4" direction="column">
          <Box {...getRootProps()} width="100%">
            <Flex align="center" gap="3" mb="2">
              <Button
                size="2"
                radius="large"
                type="button"
              >
                <UploadIcon className="h-6 w-6" />
                Browse files
              </Button>
              <Text>or drop to upload</Text>
              <input {...getInputProps()} />
            </Flex>
          </Box>
          {currentFile && (
              <Text size="2" color="gray" my="2">{currentFile.name}</Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
