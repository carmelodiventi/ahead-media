import { ActionFunctionArgs } from '@remix-run/node';
import { runWorkflow } from '../utils/templateWorkflow.server';
import { WorkflowConfig } from '../types/Workflow.types';
import { createSupabaseServerClient } from '../utils/supabase.server';
import {z} from "zod";

const workflowConfig: WorkflowConfig = {
  name: 'Blog Post Workflow',
  inputs: {
    about: {
      type: 'string',
      description: 'The main topic of the blog',
      required: true,
    },
    keywords: {
      type: 'string',
      description: 'Relevant keywords',
      required: false,
    },
    wordCount: {
      type: 'number',
      description: 'Target word count',
      required: false,
    },
    topic: {
      type: 'string',
      description: 'Topic for the blog',
      required: false,
    },
    tone: { type: 'string', description: 'Tone of the blog', required: false },
    goal: { type: 'string', description: 'Goal of the blog', required: false },
  },
  steps: [
    {
      name: 'generateTitle',
      type: 'sequential',
      systemPrompt: 'You are an expert content marketer',
      userPrompt: `Generate a catchy title for a blog about {{about}}. \n{{#keywords}}\nInclude the keywords {{keywords}} if relevant. \n{{/keywords}}\n`,
      usesInputs: ['about', 'keywords'], // about is required
      inputMapping: {
        about: 'initialInputs.about',
        keywords: 'initialInputs.keywords',
      },
      llmParams: { temperature: 0.7, frequencyPenalty: 0.5 },
      stream: false,
    },
    {
      name: 'generateOutline',
      type: 'sequential',
      systemPrompt:
        'You are an expert content marketer. Your work is to write engaging and logical content in a quirky way so that the reader stays connected throughout while reading the blog. Note that you can also use sarcasm and humour to hook the audience.',
      userPrompt:
        'As a content marketer, generate an outline for a blog on {{topic}} \n{{#keywords}}\nUse the keywords {{keywords}} if relevant. \n{{/keywords}} \n{{#wordLimit}}\nThe overall word count limit is of {{wordLimit}} words. \nThe sum of word counts for all headings should "STRICTLY" add up to {{wordLimit}}\n{{/wordLimit}}\n{{^wordLimit}}\nThe overall word count limit is of 1200 words. \n{{/wordLimit}}\n\n{{#tone}}\nThe tone of the blog should be {{tone}}. \n{{/tone}}\n{{^tone}}\nThe tone of the blog should be casual. \n{{/tone}}\n\n{{#goal}}\nThe goal of the blog is {{goal}}. \n{{/goal}}\n{{^goal}}\nThe goal of the blog is reader engagement. \n{{/goal}}\n1. Include individual word count for each heading in the response, not sub heading.\n2. Do not include any extra information like approach, explanation or heading other than the outline.\n3. Return this in a json format with three keys - heading, subheadings and wordcount.\n4. For each heading in the outline, follow the given format example\n{"outline": [{"heading" :  "Introduction"\n              "subheadings" : ["Definition of meditation","Brief history of meditation","Importance of meditation"],\n              "wordcount" : 150}, \n              {"heading" :  "Physical benefits of meditation"\n               "subheadings" : ["Reduces stress and anxiety","Decreases blood pressure","Improves immune function","Decreases inflammation","Improves sleep"],\n               "wordcount" : 200}]}\n5. Make sure that "Introduction" and "Conclusion" are included in headings\n6. Make sure that the number of headings including introduction and conclusion are according to the word limit. Eg. for 300 words 3-4 headings are enough, for 1200 words 6-7 headings are enough.\n\nThe sum of word counts for all headings including the introduction and conclusion should "STRICTLY" add up to the word limit given. Under no case should it be more than word count limit. ',
      usesInputs: ['topic'],
      inputMapping: {
        topic: 'generateTitle',
        wordCount: 'initialInputs.wordCount',
        keywords: 'initialInputs.keywords',
        tone: 'initialInputs.tone',
        goal: 'initialInputs.goal',
      },
      llmParams: { temperature: 1, presencePenalty: 2, frequencyPenalty: 2 },
      zodSchema: z.object({
        outline: z.array(
          z.object({
            heading: z.string(),
            subheadings: z.array(z.string()),
            wordcount: z.number(),
          })
        ),
      }),
      expectJson: true,
      stream: true,
    },
    {
      name: 'generateBlogParagraphs',
      type: 'forEach',
      for_each_config: {
        source: 'generateOutline',
        field: 'outline',
        item_input_parameter_name: 'section',
      },
      sub_step: {
        name: 'generateParagraph',
        type: 'sequential',
        systemPrompt:
          'You are an expert content marketer. Your task is to write engaging content based on the provided heading, subheadings, and target word count. Write in a quirky style using sarcasm and humour. Ensure the content flows seamlessly.',
        userPrompt:
          'Write content for the heading: {{section.heading}}\nSubheadings: {{section.subheadings}}\n\nTarget word count: {{section.wordcount}}\n\n{{#tone}}\nUse a {{tone}} tone.\n{{/tone}}\n{{^tone}}\nUse a casual tone.\n{{/tone}}\n\n{{#goal}}\nThe goal of this content is {{goal}}.\n{{/goal}}\n{{^goal}}\nThe goal of this content is reader engagement.\n{{/goal}}\n\nEnsure the content is engaging, flows well, and stays within the word count limit.',
        usesInputs: ['section', 'tone', 'goal'], // section is required
        inputMapping: {
          section: 'generateOutline.outline',
        },
        llmParams: { temperature: 0.7, frequencyPenalty: 0.5 },
        stream: true,
      },
    },
  ],
};

const initialInputs = {
  about: 'b2b lead generation',
  keywords: 'b2b, lead generation, marketing',
  wordCount: 1500,
  tone: 'professional',
  goal: 'lead generation',
};


export const actions = async ({ request }: ActionFunctionArgs) => {

  try{
    const formData = await request.formData();
    const templateId = formData.get('templateId');
    const initialInputs = formData.get('initialInputs');

    if (!templateId || initialInputs) {
     throw new Error('Template id is required');
    }

    const { supabaseClient } = createSupabaseServerClient(request);

    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }

    const response = await runWorkflow(data as WorkflowConfig, {});
    return {
      response,
    };
  }
  catch (error){
    return new Response((error as Error).message, {
      status: 400,
    });
  }

};
