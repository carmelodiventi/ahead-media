import { FormEvent, useEffect, useState } from 'react';
import to from 'await-to-js';
import request from '../../helpers/request';
import { LoaderData } from '../../routes/app.templates';

function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [originalTemplates, setOriginalTemplates] = useState<Template[]>([]);

  const filter = (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    if (value === '') {
      setTemplates(originalTemplates);
      return;
    }

    const filtered = originalTemplates.filter((template) =>
      template.title.toLowerCase().includes(value.toLowerCase())
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
    templates
  };
}

export default useTemplates;
