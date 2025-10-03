# Channel Optimization Tool - Next.js

A Next.js serverless application for generating media plans from YAML input using OpenAI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## API

### POST /api/plan

Generate a media plan from YAML input.

**Request:**
```json
{
  "yaml_input": "client:\n  business_name: ..."
}
```

**Response:**
```json
{
  "json": { ... },
  "markdown": "..."
}
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to set your environment variables in the Vercel dashboard.
