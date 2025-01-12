import './DocumentFinder.styles.css';
import {
  Button,
  Text,
  Dialog,
  Flex,
  RadioCards,
  TextField,
  Grid,
  Box,
  IconButton,
} from '@radix-ui/themes';
import {
  CaretRightIcon,
  MagnifyingGlassIcon,
  PaperPlaneIcon,
} from '@radix-ui/react-icons';
import { Form, useFetcher } from '@remix-run/react';
import { FormEvent, Fragment, useState } from 'react';
import * as Label from '@radix-ui/react-label';
import { action } from '../../../routes/_app.app.documents';
import useTemplates from '../../../hooks/useTemplates/useTemplates';
import { WorkflowTemplate } from '../../../types/Workflow.types';
import PromptEditor from './components/promptEditor';
import { z } from 'zod';
import { toast } from 'sonner';

const createSchema = (template: any) => {
  const inputSchema = Object.keys(template?.config?.inputs || {}).reduce(
    (acc, input) => {
      const field = template.config.inputs[input];
      if (field.required) {
        acc[input] = z.string().nonempty(`${field.label} is required`);
      } else {
        acc[input] = z.string().optional();
      }
      return acc;
    },
    {} as Record<string, z.ZodTypeAny>
  );

  return z.object(inputSchema);
};

const DocumentFinder = () => {
  const [step, setStep] = useState({
    selectTemplate: true,
    selectMetaSettings: false,
  });
  const [initialInput, setInitialInput] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { templates, filter } = useTemplates();
  const [template, setTemplate] = useState<null | Pick<
    WorkflowTemplate,
    'id' | 'name' | 'description' | 'config' | 'template_prompt'
  >>(null);

  const fetcher = useFetcher<typeof action>();

  const handleSelectTemplate = (value: string) => {
    setTemplate(templates?.find((t) => t.id === value) || null);
    setStep({
      selectTemplate: false,
      selectMetaSettings: true,
    });
  };

  const requiredInputs =
    template &&
    Object.keys(template.config.inputs).find(
      (input) => template.config.inputs[input].required
    );

  const validateField = (name: string, value: string) => {
    if (!template) return;

    const schema = createSchema(template);
    try {
      schema.shape[name].parse(value); // Validate only the specific field
      setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error if valid
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [name]: error.errors[0].message })); // Set error
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!template) return;

    const schema = createSchema(template);

    try {
      schema.parse(initialInput); // Validate all fields
      // If validation passes, proceed with form submission
      const formData = new FormData(event.currentTarget);
      formData.append('templateId', template.id);
      formData.append('initialInputs', JSON.stringify(initialInput));
      fetcher.submit(formData, {
        method: 'post',
        action: '/app/ai/template-workflow',
      });
    } catch (error: any) {
      // Set errors for invalid fields
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        fieldErrors[err.path[0]] = err.message;
      });

      toast.error('Please fill in all required fields');

      setErrors(fieldErrors);
    }
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
                      <RadioCards.Item value={String(template.id)} mb={'1'} key={template.id}>
                        <Flex direction="column" width="100%">
                          <Text weight="bold">{template.name}</Text>
                          <Text truncate>{template.description}</Text>
                        </Flex>
                      </RadioCards.Item>
                    ))}
                  </RadioCards.Root>
                </Flex>
              )}

              {step.selectMetaSettings && (
                <>
                  <Grid
                    gap="2"
                    columns={'1fr 30px'}
                    className={'PromptEditor'}
                    p={'4'}
                  >
                    <Box>
                      <Text wrap={'nowrap'}>{template?.template_prompt}</Text>
                      <PromptEditor
                        placeholder={
                          requiredInputs &&
                          template.config.inputs[requiredInputs]?.placeholder
                        }
                        onChange={(value) => {
                          console.log('Prompt updated:', value);
                          validateField(requiredInputs as string, value);
                          setInitialInput((prev) => ({
                            ...prev,
                            [requiredInputs as string]: value, // Update the key with the user's value
                          }));
                        }}
                      />
                    </Box>
                    <IconButton type="submit" highContrast={true} color="gray">
                      <PaperPlaneIcon />
                    </IconButton>
                  </Grid>

                  {errors[requiredInputs as string] && (
                    <Text size="2" color="red" mt="1" mx={'4'}>
                      {errors[requiredInputs as string]}
                    </Text>
                  )}

                  <Flex
                    direction={'column'}
                    gap={'4'}
                    className={'PromptEditor-UserInput'}
                  >
                    <Grid columns={'3'} gap="2">
                      {template?.config?.inputs &&
                        Object.keys(template.config.inputs).map((input, index) => {
                          if (template.config.inputs[input].required)
                            return null;
                          return (
                            <Fragment key={`${input}-${index}`}>
                              <Box gridColumnStart={'1'} gridColumnEnd={'2'}>
                                <Label.Root
                                  htmlFor="language"
                                  aria-colcount={1}
                                >
                                  {template?.config?.inputs[input].label}
                                </Label.Root>
                              </Box>
                              <Box gridColumnStart={'2'} gridColumnEnd={'4'}>
                                <textarea
                                  className={'PromptEditor-UserInput-Textarea'}
                                  name={input}
                                  placeholder={
                                    template.config.inputs[input].placeholder
                                  }
                                  style={{
                                    width: '100%',
                                  }}
                                  onChange={(e) => {
                                    const { name, value } = e.target;
                                    validateField(name, value);
                                    setInitialInput((prev) => ({
                                      ...prev,
                                      [name]: value, // Update the key-value pair in initialInput
                                    }));
                                  }}
                                ></textarea>
                                {errors[input] && (
                                  <Text size="2" color="red" mt="1">
                                    {errors[input]}
                                  </Text>
                                )}
                              </Box>
                            </Fragment>
                          );
                        })}
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
