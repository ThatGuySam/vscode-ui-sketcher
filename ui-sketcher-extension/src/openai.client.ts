import OpenAI from "openai";

type UITransformerConfig = {
  apiKey: string;
  maxTokens: number;
  onChunk?: (chunk: string) => Promise<void>;
  stack?: string;
  customInstructions?: string;
  preCode?: string;
  postCode?: string;
};

const START_QUOTE_REGEX = /```\w*\n/;
const PARTIAL_END_QUOTE = /\n`{0,3}$/;
const END_QUOTE_REGEX = /\n```$/;

export const uiToComponent = async (
  base64Image: string,
  {
    apiKey,
    stack,
    onChunk,
    maxTokens,
    customInstructions = "",
    preCode,
    postCode,
  }: UITransformerConfig,
) => {
  const client = new OpenAI({ apiKey });

  // SYSTEM PROMPT

  let systemPrompt = `You are an expert frontend developer.
Your task is to integrate mockups.
Only respond with the code output inside a code block. Do not include any other text.`;

  if (customInstructions) {
    systemPrompt += "\n" + customInstructions;
  }

  // USER PROMPT

  let userPrompt = "Turn this image into code";

  if (stack && stack.length > 0) {
    userPrompt += "\n\nThe project's stack is: " + stack;
  }

  if (preCode && postCode) {
    userPrompt += `
    
The current file content is:
\`\`\`
${preCode}/* THE OUTPUT CODE WILL BE WRITTEN HERE */${postCode}
\`\`\`
`;
  }

  const response = await client.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: maxTokens,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image,
            },
          },
        ],
      },
    ],
  });

  let buffer = "";
  let output = "";
  let hasCodeStarted = false;

  for await (const chunk of response) {
    if (chunk.choices.length === 0 || !chunk.choices[0].delta.content) continue;

    const textChunk = chunk.choices[0].delta.content;

    buffer += textChunk;

    // We want to strip everything but the code
    if (!hasCodeStarted) {
      hasCodeStarted = START_QUOTE_REGEX.test(buffer);

      if (hasCodeStarted) {
        if (buffer.length > 0) {
          const code = buffer.replace(START_QUOTE_REGEX, "");
          output += code;
          if (onChunk) await onChunk(code);
        }
        buffer = "";
      }

      continue;
    }

    if (PARTIAL_END_QUOTE.test(buffer)) {
      if (END_QUOTE_REGEX.test(buffer)) {
        const code = buffer.replace(END_QUOTE_REGEX, "");
        output += code;
        if (onChunk) await onChunk(code);
        break;
      }

      // If full end quote, stop quoting
      continue;
    }

    output += buffer;
    if (onChunk) await onChunk(buffer);
    buffer = "";
  }

  return output;
};