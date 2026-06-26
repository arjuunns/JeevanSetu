import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { env, features } from '../config/env.js';
import { ServiceUnavailableError } from './errors.js';

/**
 * Lazily-constructed Gemini clients. The platform is designed to run without a
 * Gemini key (intake + safety still work); any call that genuinely needs the
 * model throws a typed ServiceUnavailableError that the caller can degrade on.
 */
let _chat: ResilientChatModel | null = null;
let _embeddings: GeminiEmbeddings | null = null;

export class ResilientChatModel {
  constructor(
    private readonly primary: ChatGoogleGenerativeAI,
    private readonly fallbacks: ChatGoogleGenerativeAI[],
  ) {}

  async invoke(input: any, options?: any): Promise<any> {
    const model = this.primary.withFallbacks({
      fallbacks: this.fallbacks,
    });
    return model.invoke(input, options);
  }

  withStructuredOutput(schema: any, config?: any): any {
    const primaryStructured = this.primary.withStructuredOutput(schema, config);
    const fallbackStructureds = this.fallbacks.map((f) =>
      f.withStructuredOutput(schema, config)
    );
    return primaryStructured.withFallbacks({
      fallbacks: fallbackStructureds,
    });
  }
}

/**
 * Must match the dimension of the Pinecone index (jeevansetu-guidelines) and
 * the ingestion pipeline (medical-pdf/ingestion). gemini-embedding-001 uses
 * Matryoshka representations: vectors are truncated to this size by the API
 * and re-normalized here, per Google's guidance for non-3072 dimensions.
 */
export const EMBEDDING_DIMENSION = 1024;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Direct REST client for Gemini embeddings. @langchain/google-genai@0.1.x
 * cannot set outputDimensionality, and text-embedding-004 (the previous
 * model) has been retired by Google, so this calls batchEmbedContents itself.
 */
class GeminiEmbeddings {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embed(texts, 'RETRIEVAL_DOCUMENT');
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embed([text], 'RETRIEVAL_QUERY');
    if (!vector) throw new ServiceUnavailableError('Gemini embeddings (empty response)');
    return vector;
  }

  private async embed(texts: string[], taskType: string): Promise<number[][]> {
    const url = `${GEMINI_API_BASE}/models/${this.model}:batchEmbedContents?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${this.model}`,
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: EMBEDDING_DIMENSION,
        })),
      }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableError(`Gemini embeddings (${res.status})`);
    }
    const data = (await res.json()) as { embeddings: { values: number[] }[] };
    return data.embeddings.map((e) => normalize(e.values));
  }
}

function normalize(values: number[]): number[] {
  const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? values : values.map((v) => v / norm);
}

export function getChatModel(overrides?: { temperature?: number; model?: string }): ResilientChatModel {
  if (!features.ai) throw new ServiceUnavailableError('Gemini');
  if (!_chat || overrides) {
    const primaryModelName = overrides?.model ?? env.GEMINI_TRIAGE_MODEL ?? 'gemini-2.5-flash';
    
    // Fallback order: gemini-2.5-flash, gemini-2.0-flash, gemini-3.5-flash, gemini-2.5-pro
    const fallbackNames = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-2.5-pro']
      .filter((m) => m !== primaryModelName);

    const primary = new ChatGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY,
      model: primaryModelName,
      temperature: overrides?.temperature ?? 0.1,
      maxRetries: 1,
    });

    const fallbacks = fallbackNames.map((modelName) => {
      return new ChatGoogleGenerativeAI({
        apiKey: env.GEMINI_API_KEY,
        model: modelName,
        temperature: overrides?.temperature ?? 0.1,
        maxRetries: 1,
      });
    });

    const resilientModel = new ResilientChatModel(primary, fallbacks);

    if (!overrides) {
      _chat = resilientModel;
    }
    return resilientModel;
  }
  return _chat;
}

export function getEmbeddings(): GeminiEmbeddings {
  if (!features.ai) throw new ServiceUnavailableError('Gemini');
  if (!_embeddings) {
    _embeddings = new GeminiEmbeddings(env.GEMINI_API_KEY as string, env.GEMINI_EMBEDDING_MODEL);
  }
  return _embeddings;
}
