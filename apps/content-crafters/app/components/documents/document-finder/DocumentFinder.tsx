import './DocumentFinder.styles.css';
import {
  Button,
  Text,
  Dialog,
  Flex,
  RadioCards,
  Select,
  TextField,
  Grid,
  Box, IconButton,
} from '@radix-ui/themes';
import {CaretRightIcon, MagnifyingGlassIcon, PaperPlaneIcon} from '@radix-ui/react-icons';
import { Form, useFetcher } from '@remix-run/react';
import { FormEvent, useState } from 'react';
import * as Label from '@radix-ui/react-label';
import { action } from '../../../routes/_app.app.documents';
import useTemplates from '../../../hooks/useTemplates/useTemplates';

const DocumentFinder = () => {
  const [step, setStep] = useState({
    selectTemplate: true,
    selectMetaSettings: false,
  });

  const { templates, filter } = useTemplates();
  const [template, setTemplate] = useState<null | Template>(null);
  const fetcher = useFetcher<typeof action>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step.selectTemplate) {
      setStep({
        selectTemplate: false,
        selectMetaSettings: true,
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    fetcher.submit(
      formData, //Notice this change
      { method: 'post', action: '/app/documents' }
    );
  };

  const handleSelectTemplate = (value: string) => {
    setTemplate(templates?.find((t) => t.id === Number(value)) || null);
    setStep({
      selectTemplate: false,
      selectMetaSettings: true,
    });
  };

  return (
    <>
      <Dialog.Root
        onOpenChange={() => {
          setStep({
            selectTemplate: true,
            selectMetaSettings: false,
          });
        }}
      >
        <Flex gap={'2'} align="center" justify="between">
          <Dialog.Trigger>
            <Button
              color="gray"
              size="3"
              style={{
                width: '100%',
              }}
              highContrast={true}
            >
              Create new <CaretRightIcon height={'24px'} width={'24px'} />
            </Button>
          </Dialog.Trigger>
        </Flex>

        <Dialog.Content
          maxWidth="650px"
          style={{
            padding: '0',
          }}
        >
          <Form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              {step.selectTemplate && (
                <Flex p={'4'} direction={'column'} gap={'2'}>
                  <Dialog.Title>Create a new</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Select a template to start creating.
                  </Dialog.Description>

                  <TextField.Root onChange={filter} size={'3'}>
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>

                  <RadioCards.Root
                    defaultValue={template?.id ? String(template) : undefined}
                    onValueChange={handleSelectTemplate}
                    gap="1"
                    columns={{ initial: '1' }}
                  >
                    {templates?.map((template) => (
                      <RadioCards.Item value={String(template.id)} mb={'1'}>
                        <Flex direction="column" width="100%">
                          <Text weight="bold">{template.title}</Text>
                          <Text truncate>{template.description}</Text>
                        </Flex>
                      </RadioCards.Item>
                    ))}
                  </RadioCards.Root>
                </Flex>
              )}

              {step.selectMetaSettings && (
                <>
                  <Flex
                    gap="2"
                    direction="row"
                    className={'PromptEditor'}
                    p={'4'}
                  >
                    <Text wrap={'nowrap'}>{template?.template_prompt}</Text>
                    <Text wrap={'wrap'} contentEditable="true"></Text>

                    <IconButton
                      type="submit"
                      variant="solid"
                      color="blue">
                      <PaperPlaneIcon />
                    </IconButton>
                  </Flex>

                  <Flex
                    direction={'column'}
                    gap={'4'}
                    className={'PromptEditor-UserInput'}
                  >
                    <Grid columns={'3'} gap="2">
                      {template?.user_inputs.map((input) => (
                        <>
                          <Box gridColumnStart={'1'} gridColumnEnd={'2'}>
                            <Label.Root htmlFor="language" aria-colcount={1}>
                              {input.name}
                            </Label.Root>
                          </Box>
                          <Box gridColumnStart={'2'} gridColumnEnd={'4'}>
                            {input.type === 'text' && (
                              <textarea
                                className={'PromptEditor-UserInput-Textarea'}
                                name={input.name}
                                placeholder={input.placeholder}
                                style={{
                                  width: '100%',
                                }}
                              ></textarea>
                            )}
                          </Box>
                        </>
                      ))}
                    </Grid>
                  </Flex>
                </>
              )}
            </Flex>
          </Form>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default DocumentFinder;
