# Research pipeline: safety rules, ESI guidance and RAG on MIMIC-IV-ED

Reproduces every number in the paper. Run from the repo root.

```bash
python3 -I research/build_cohort.py                          # 1. data/mimic_ed_cohort.json
ollama serve & ollama pull bge-m3                            # 2. local embeddings (and step 5 models)
pnpm --filter @jeevansetu/server mimic:retrieval-cache        # 3. research/retrieval_cache.json (GEMINI_API_KEY for the rerank)
python3 -I research/retrieval_eval.py make                    # 4. blinded retrieval rating page
ollama pull qwen2.5:7b llama3.1:8b                            # 5. triage models
research/run_ablation.sh qwen2.5:7b llama3.1:8b              # 6. research/results/<run>.json (resumable)
python3 -I research/analyze.py                                # 7. research/results/summary.{md,json}
python3 -I research/retrieval_eval.py score                   # 8. retrieval quality, after rating
```

A single condition: `pnpm --filter @jeevansetu/server mimic:eval --model=qwen2.5:7b --rag=on --safety=off [--guide=on] [--limit=5]`.

## Design decisions (Methods)

**Data.** MIMIC-IV-ED Demo v2.2 plus the MIMIC-IV Demo v2.2 `patients` table for age (PhysioNet, open access, ODbL 1.0). All 207 ED stays with a recorded triage acuity; 15 stays without acuity are excluded. Reference ESI distribution: 1: 18, 2: 97, 3: 90, 4: 2, 5: 0. The reference standard is the triage nurse's ESI, not expert consensus.

**Inputs (no leakage).** Only information available at triage: age, sex, arrival mode, chief complaint, triage vitals and numeric pain score. Not used: discharge diagnoses, disposition, later vital signs, GCS (not recorded at MIMIC triage) and free-text pain entries. Missing vitals stay missing; implausible values are set to missing and listed in the cohort file's `meta`.

**Conditions.** Rules only (safety engine plus vital-sign heuristic, no LLM) and six LLM conditions per model: LLM only; + safety; + ESI guide; + ESI guide + safety; + RAG; full (RAG + safety). The system prompt is identical in every LLM condition; conditions differ only in which sections the user prompt contains (safety verdict, ESI algorithm reference, retrieved excerpts). "Safety on" also enforces the post-hoc override to ESI 1 when a rule fires.

**ESI guide.** A curated summary of the ESI v4 algorithm (decision points A to D, life-saving interventions, high-risk examples, resource rules, danger-zone vitals), paraphrased from the ESI v4 Implementation Handbook (Gilboy et al., AHRQ 2012), in `apps/server/src/modules/triage/esi.guide.ts`. The guide condition includes it whole; RAG can retrieve it as chunks.

**Retrieval.** Corpus: 386 chunks from `medical-pdf/ingestion` (WHO guideline `9789241513081-eng.pdf`: 309, ESI Handbook: 77) plus 13 paragraph-level chunks of the ESI guide. Excluded before any RAG results were seen: the 38-chunk abbreviations list (no triage guidance). The CTAS PDF was never ingested. Query: age, sex, chief complaint with common ED abbreviations expanded, and abnormal vitals named using ESI danger-zone thresholds. Candidates: dense cosine search (bge-m3 via Ollama, run locally, 1024 dims) and BM25, fused by reciprocal rank fusion (k = 60), top 20. Reranking: gemini-3.5-flash-lite picks the 5 passages most useful for assigning an ESI level. Excerpts carry the full chunk text (up to 2,000 characters). Computed once per case and cached, so all models and conditions see identical excerpts. Curated chunks were split to paragraph level after a 3-case smoke test showed section-level chunks never reached the candidate pool (inputs only; no labels used).

**Decoding.** Temperature 0, seed 42, context window 8,192 tokens, JSON-schema-constrained output, up to 3 attempts. Each case is `ok` (valid model output), `fallback` (all attempts failed; heuristic answered) or `error`. Metrics use `ok` cases; the other counts are reported per run.

**Statistics.** Exact accuracy, within-one accuracy, under-triage (predicted less urgent than reference), over-triage, severe under-triage (two or more levels) and quadratic-weighted kappa; high-acuity detection (ESI 1-2 vs 3-5: sensitivity, specificity, PPV, NPV); under-triage among patients later admitted; expected calibration error of self-reported confidence. 95% percentile-bootstrap CIs (2,000 resamples). Paired condition comparisons use the exact McNemar test on cases valid in both runs. Safety-rule precision and sensitivity come from the deterministic rules alone.

**Retrieval quality.** 30 randomly sampled cases; the top-5 passages from the baseline retrieval (`research/retrieval_cache_baseline.json`: dense only, raw complaint query, 600-character excerpts) and the improved retrieval are pooled, shuffled and rated blind (0, 1, 2) for usefulness in assigning the patient's ESI level. Reported: precision@5, strict precision@5, mean graded relevance, nDCG@5, and an exact sign test on per-case precision@5.

## Files

| Path | What |
|---|---|
| `research/build_cohort.py` | Builds the cohort from the raw CSVs |
| `apps/server/scripts/mimic_cohort.ts` | Loads the cohort; converts triage inputs to engine inputs |
| `apps/server/scripts/build_retrieval_cache.ts` | Hybrid retrieval + rerank, cached per case |
| `apps/server/scripts/evaluate_mimic.ts` | Runs one condition |
| `research/run_ablation.sh` | Runs every condition for the given models |
| `research/analyze.py` | Statistics and tables |
| `research/retrieval_eval.py` | Blinded retrieval rating and scoring |

The earlier `data/mimic_benchmark_150.json` and root `mimic_benchmark_*` files were deleted: they leaked the label (severity and GCS derived from ESI, discharge diagnoses as history, invented ages). `apps/server/scripts/ingest_mimic.ts` and `run_100_patients_ollama_benchmark.ts` still expect that file and are not part of this pipeline.
