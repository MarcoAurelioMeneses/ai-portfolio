import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import {
  buildKnowledgeChunks,
  type KnowledgeChunk,
} from "@/content/knowledge";
import type { KnowledgeProviderName } from "@/lib/config";

export interface KnowledgeRetriever {
  readonly name: KnowledgeProviderName;
  retrieve(query: string, limit?: number): Promise<KnowledgeChunk[]>;
}

/**
 * Current default: the whole site fits in the system prompt, so retrieval
 * returns every chunk. Swap this for {@link createPgVectorRetriever} when
 * KNOWLEDGE_PROVIDER=pgvector and the Supabase table is populated.
 */
export function createStaticRetriever(): KnowledgeRetriever {
  const chunks = buildKnowledgeChunks();
  return {
    name: "static",
    async retrieve(_query, limit) {
      return typeof limit === "number" ? chunks.slice(0, limit) : chunks;
    },
  };
}

type MatchRow = {
  id: string;
  source: string;
  content: string;
};

/**
 * Future RAG path. Embeds the user query and calls `match_knowledge`.
 * Any failure falls back to the static corpus so chat keeps working.
 */
export function createPgVectorRetriever(): KnowledgeRetriever {
  const fallback = createStaticRetriever();
  return {
    name: "pgvector",
    async retrieve(query, limit = 6) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key || !process.env.OPENAI_API_KEY) {
        return fallback.retrieve(query);
      }
      try {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: query,
        });
        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await client.rpc("match_knowledge", {
          query_embedding: `[${embedding.join(",")}]`,
          match_count: limit,
        });
        if (error) throw error;
        const rows = (data ?? []) as MatchRow[];
        if (rows.length === 0) return fallback.retrieve(query);
        return rows.map((row) => ({
          id: row.id,
          source: row.source,
          content: row.content,
        }));
      } catch (error) {
        console.warn("pgvector retrieval failed; using static knowledge.", error);
        return fallback.retrieve(query);
      }
    },
  };
}

export function createRetriever(
  provider: KnowledgeProviderName,
): KnowledgeRetriever {
  if (provider === "pgvector") return createPgVectorRetriever();
  return createStaticRetriever();
}
