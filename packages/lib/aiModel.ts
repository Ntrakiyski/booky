import { LanguageModelV2 } from "@ai-sdk/provider";
import {
  createOpenAICompatible,
  OpenAICompatibleProviderSettings,
} from "@ai-sdk/openai-compatible";
import { perplexity } from "@ai-sdk/perplexity";
import { azure } from "@ai-sdk/azure";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOllama } from "ollama-ai-provider-v2";

const ensureValidURL = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

export const getAIModel = (): LanguageModelV2 => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) {
    let config: OpenAICompatibleProviderSettings = {
      baseURL:
        process.env.CUSTOM_OPENAI_BASE_URL || "https://api.openai.com/v1",
      name: process.env.CUSTOM_OPENAI_NAME || "openai",
      apiKey: process.env.OPENAI_API_KEY,
    };

    const openaiCompatibleModel = createOpenAICompatible(config);

    return openaiCompatibleModel(process.env.OPENAI_MODEL);
  }
  if (
    process.env.AZURE_API_KEY &&
    process.env.AZURE_RESOURCE_NAME &&
    process.env.AZURE_MODEL
  )
    return azure(process.env.AZURE_MODEL);
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL)
    return anthropic(process.env.ANTHROPIC_MODEL);
  if (process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT_URL && process.env.OLLAMA_MODEL) {
    const ollama = createOllama({
      baseURL: ensureValidURL(
        process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT_URL,
        "api"
      ),
    });

    return ollama(process.env.OLLAMA_MODEL);
  }
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL) {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    return openrouter(process.env.OPENROUTER_MODEL) as LanguageModelV2;
  }
  if (process.env.PERPLEXITY_API_KEY) {
    return perplexity(process.env.PERPLEXITY_MODEL || "sonar-pro");
  }
  throw new Error("No AI provider configured");
};

export const isAIConfigured = (): boolean => {
  return !!(
    (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) ||
    (process.env.AZURE_API_KEY &&
      process.env.AZURE_RESOURCE_NAME &&
      process.env.AZURE_MODEL) ||
    (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL) ||
    (process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT_URL && process.env.OLLAMA_MODEL) ||
    (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL) ||
    process.env.PERPLEXITY_API_KEY
  );
};
