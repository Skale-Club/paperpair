// Curated list of chat models for Paperpair
// Google Gemini as primary, OpenAI and OpenRouter as alternatives

export const DEFAULT_CHAT_MODEL = "google/gemini-2.5-flash-lite";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Google (Primary)
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Ultra fast and affordable - best for intake",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Fast with good reasoning",
  },
  // OpenAI
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Fast and cost-effective",
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Most capable OpenAI model",
  },
  // OpenRouter
  {
    id: "openrouter/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "openrouter",
    description: "Great for complex reasoning",
  },
  {
    id: "openrouter/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "openrouter",
    description: "Open source, fast and capable",
  },
  {
    id: "openrouter/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    provider: "openrouter",
    description: "Balanced speed and quality",
  },
];

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
