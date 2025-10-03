import OpenAI from 'openai';
import { Plan } from './schemas';

export interface LLMResponse {
  json: Plan;
  markdown: string;
}

export async function generatePlan(
  yamlInput: string,
  systemPrompt: string
): Promise<LLMResponse> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const userPrompt = `\`\`\`yaml\n${yamlInput}\n\`\`\``;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from LLM');
  }

  return parseResponse(content);
}

function parseResponse(content: string): LLMResponse {
  // Extract JSON block
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) {
    throw new Error('No JSON block found in LLM response');
  }

  const jsonStr = jsonMatch[1];
  let json: Plan;
  try {
    json = JSON.parse(jsonStr);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }

  // Extract Markdown (everything after the JSON block and ---)
  const parts = content.split('---');
  let markdown = '';
  if (parts.length >= 2) {
    const afterJson = content.substring(content.indexOf('---'));
    const mdParts = afterJson.split('---');
    if (mdParts.length >= 2) {
      markdown = mdParts.slice(1).join('---').trim();
    }
  }

  if (!markdown) {
    throw new Error('No Markdown section found in LLM response');
  }

  return { json, markdown };
}
