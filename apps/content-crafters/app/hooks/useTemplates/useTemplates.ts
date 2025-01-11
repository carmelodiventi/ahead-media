import { FormEvent, useEffect, useState } from 'react';
import to from 'await-to-js';
import request from '../../helpers/request';
import { LoaderData } from '../../routes/app.templates';
import { WorkflowTemplate } from '../../types/Workflow.types';

function useTemplates() {
  const [templates, setTemplates] = useState<Pick<WorkflowTemplate, 'id' | 'name' | 'description' | 'config' | 'template_prompt'>[]>([]);
  const [originalTemplates, setOriginalTemplates] = useState<
    Pick<WorkflowTemplate, 'id' | 'name' | 'description' | 'config' | 'template_prompt'>[]
  >([]);

  const filter = (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    if (value === '') {
      setTemplates(originalTemplates);
      return;
    }

    const filtered = originalTemplates.filter((template) =>
      template.name.toLowerCase().includes(value.toLowerCase())
    );

    setTemplates(filtered);
  };

  const fetchTemplates = async () => {
    const [err, response] = await to(
      request<LoaderData>({
        url: '/app/templates',
        method: 'GET',
      })
    );

    if (err) {
      console.error(err);
      return;
    }

    setTemplates(response.data.templates);
    setOriginalTemplates(response.data.templates);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    filter,
    templates,
  };
}

export default useTemplates;
