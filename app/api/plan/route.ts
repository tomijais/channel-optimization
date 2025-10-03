import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import * as fs from 'fs/promises';
import * as path from 'path';
import { InputYAMLSchema, PlanSchema, validatePlan } from '@/lib/schemas';
import { generatePlan } from '@/lib/llm';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yaml_input, options } = body;

    if (!yaml_input) {
      return NextResponse.json({ error: 'Missing yaml_input in request body' }, { status: 400 });
    }

    let parsedYaml;
    try {
      const yamlObj = yaml.load(yaml_input);
      parsedYaml = InputYAMLSchema.parse(yamlObj);
    } catch (error: any) {
      return NextResponse.json({ error: 'Invalid YAML input', message: error.message }, { status: 400 });
    }

    const promptPath = path.join(process.cwd(), 'lib', 'SYSTEM_PROMPT.md');
    const systemPrompt = await fs.readFile(promptPath, 'utf-8');

    let llmResponse;
    try {
      llmResponse = await generatePlan(yaml_input, systemPrompt);
    } catch (error: any) {
      return NextResponse.json({ error: 'Generation failed', message: error.message }, { status: 500 });
    }

    let validatedPlan;
    try {
      validatedPlan = PlanSchema.parse(llmResponse.json);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid plan schema', message: error.message, issues: error.issues },
        { status: 422 }
      );
    }

    const businessValidation = validatePlan(validatedPlan);
    if (!businessValidation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: businessValidation.errors },
        { status: 422 }
      );
    }

    return NextResponse.json({
      id: randomUUID(),
      json: validatedPlan,
      markdown: llmResponse.markdown,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
