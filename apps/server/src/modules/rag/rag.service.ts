import type { GuidelineCitation, GuidelineSource } from '@jeevansetu/types';

import { logger } from '../../config/logger.js';
import { features } from '../../config/env.js';
import { getEmbeddings } from '../../lib/ai.js';
import { getPineconeIndex } from '../../lib/pinecone.js';
import { prisma } from '../../lib/prisma.js';
import { recordAudit, type AuditContext } from '../audit/audit.service.js';
import { chunkText } from './chunking.js';

/**
 * Phase 7 — Medical RAG System.
 *
 * Ingestion:  PDF text → chunk → embed → upsert to Pinecone → persist metadata.
 * Retrieval:  query → embed → Pinecone top-k → map to citations with sources.
 *
 * Vectors carry guideline metadata so retrieved matches resolve directly to a
 * citable source (title, page, snippet) shown to the reviewing doctor.
 */

export interface IngestGuidelineArgs {
  title: string;
  source: GuidelineSource;
  version?: string;
  description?: string;
  s3Key?: string;
  /** Extracted full text of the guideline document. */
  text: string;
  context: AuditContext;
}

export async function ingestGuideline(args: IngestGuidelineArgs): Promise<{ guidelineId: string; chunkCount: number }> {
  const guideline = await prisma.guideline.create({
    data: {
      title: args.title,
      source: args.source,
      version: args.version,
      description: args.description,
      s3Key: args.s3Key,
      status: 'PROCESSING',
      createdBy: args.context.userId ?? undefined,
    },
  });

  try {
    const chunks = chunkText(args.text);
    if (chunks.length === 0) throw new Error('No extractable text in document');

    // Persist chunk rows first so each has a stable id used as the vector id.
    const chunkRows = await prisma.$transaction(
      chunks.map((c) =>
        prisma.guidelineChunk.create({
          data: {
            guidelineId: guideline.id,
            chunkIndex: c.index,
            content: c.content,
            tokenCount: c.approxTokens,
          },
        }),
      ),
    );

    if (features.rag) {
      const embeddings = getEmbeddings();
      const vectors = await embeddings.embedDocuments(chunkRows.map((c) => c.content));
      const index = getPineconeIndex();

      await index.upsert(
        chunkRows.map((c, i) => ({
          id: c.id,
          values: vectors[i]!,
          metadata: {
            guidelineId: guideline.id,
            chunkId: c.id,
            chunkIndex: c.chunkIndex,
            source: args.source,
            title: args.title,
            content: c.content.slice(0, 2000),
          },
        })),
      );

      await prisma.$transaction(
        chunkRows.map((c) =>
          prisma.guidelineChunk.update({ where: { id: c.id }, data: { vectorId: c.id } }),
        ),
      );
    } else {
      logger.warn('RAG not configured — guideline chunks stored without vector index');
    }

    await prisma.guideline.update({
      where: { id: guideline.id },
      data: { status: features.rag ? 'INDEXED' : 'PROCESSING', chunkCount: chunkRows.length },
    });

    await recordAudit({
      action: 'GUIDELINE_UPLOADED',
      entityType: 'Guideline',
      entityId: guideline.id,
      newState: { title: args.title, source: args.source, chunkCount: chunkRows.length },
      context: args.context,
    });

    return { guidelineId: guideline.id, chunkCount: chunkRows.length };
  } catch (err) {
    await prisma.guideline.update({ where: { id: guideline.id }, data: { status: 'FAILED' } });
    logger.error({ err, guidelineId: guideline.id }, 'Guideline ingestion failed');
    throw err;
  }
}

/**
 * Retrieve the most relevant guideline chunks for a clinical query. Returns an
 * empty list (not an error) when RAG is not configured, so triage degrades to
 * model-only reasoning rather than failing.
 */
export async function retrieveGuidelines(query: string, topK = 5): Promise<GuidelineCitation[]> {
  if (!features.rag) return [];
  try {
    const embeddings = getEmbeddings();
    const queryVector = await embeddings.embedQuery(query);
    const index = getPineconeIndex();

    const result = await index.query({
      vector: queryVector!,
      topK,
      includeMetadata: true,
    });

    return (result.matches ?? []).map((m) => {
      const md = (m.metadata ?? {}) as Record<string, unknown>;
      return {
        guidelineId: String(md.guidelineId ?? ''),
        source: String(md.source ?? 'UNKNOWN'),
        title: String(md.title ?? 'Guideline'),
        chunkId: String(md.chunkId ?? m.id),
        snippet: String(md.content ?? '').slice(0, 600),
        score: m.score ?? 0,
      } satisfies GuidelineCitation;
    });
  } catch (err) {
    logger.error({ err }, 'Guideline retrieval failed — continuing without citations');
    return [];
  }
}

export async function listGuidelines() {
  return prisma.guideline.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, source: true, status: true, chunkCount: true, createdAt: true },
  });
}
