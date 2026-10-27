# Research paper workspace

Paper: deterministic safety rules + guideline RAG for small open-source LLMs in ED triage, ablation on MIMIC-IV-ED.

## Build
- `make` (or `tectonic main.tex`) from this folder. Output: `main.pdf`.
- After any LaTeX edit, build and fix every error/undefined-reference warning before reporting done.

## Citations — non-negotiable
- Cite only keys that exist in `references.bib`. Never invent a reference, author, venue, year or DOI.
- Never use the `google_scholar` source of `paper-search`: it scrapes Scholar from the user's IP and gets it blocked. For Scholar use the `serpapi` MCP; otherwise prefer `pubmed`, `semantic`, `arxiv`, `medrxiv`, `openalex`, `crossref`.
- `references.bib` is auto-exported by Zotero (Better BibTeX, collection "JeevanSetu Paper"). Never edit it by hand; Zotero overwrites it.
- To add a paper: find it (`paper-search` or `serpapi` MCP), confirm the DOI/arXiv ID/PMID resolves via Crossref (`https://api.crossref.org/works/<doi>`), build the item from that metadata, and POST it to the Zotero connector (`http://127.0.0.1:23119/connector/saveItems`, header `X-Zotero-Connector-API-Version: 3`). It lands in the collection selected in Zotero; check with `/connector/getSelectedCollection` first. Zotero must be running. Ask the user before adding papers they haven't approved.
- Citation keys come from Better BibTeX (e.g. `gaberEvaluatingLargeLanguage2025`); read them from `references.bib` after export.
- When stating what a cited paper found, it must come from its abstract/full text read in this session, not memory.

## Numbers — non-negotiable
- Every number in Results must trace to `../research/results/summary.json` (or a run file beside it). Leave a `% source:` comment next to it. Earlier benchmark numbers (from the deleted `mimic_benchmark_*` files) were invalid due to label leakage and must never be cited.
- Pipeline and design decisions for the Methods section: `../research/README.md`.
- Never round, extrapolate or fill in missing results. If a run hasn't been done, write `\textbf{TODO}`.

## Writing
- The user writes the prose; Claude outlines, critiques, fixes LaTeX/grammar and drafts only when asked. Flag drafted passages with `% drafted-by-claude` so the user can rewrite them.
- Don't overclaim novelty. Prior work to position against: Gaber et al. 2025 (LLM + RAG ESI triage on MIMIC). Our claimed gap: hard deterministic safety override + component ablation + small local models.
- Style: no em dashes (`---`, `—`) or en dashes used as punctuation; use commas, colons, parentheses or separate sentences. En dashes are fine only in numeric ranges (`10--20`). No curly quotes, ellipsis characters, arrows (→) or other Unicode symbols in prose; use LaTeX equivalents (``` ``quotes'' ```, `\ldots`, `$\rightarrow$`) only where genuinely needed.
- Avoid stock AI phrasing: "delve", "crucial", "pivotal", "leverage", "robust", "seamless", "landscape", "underscore", "it is worth noting", "in the realm of", "plays a vital role", "not only ... but also". No rule-of-three lists for rhythm, no bolded inline labels, no summary sentence closing every paragraph. Prefer plain, specific, slightly varied sentences.
- Ground truth is the triage nurse's ESI (`acuity`), not expert consensus — say so.
- Data: MIMIC-IV-ED Demo v2.2 and MIMIC-IV Demo v2.2 (patients table), PhysioNet open access, ODbL 1.0. Cite the datasets and PhysioNet. Triage LLMs run locally (Ollama); retrieval embeddings are local too (bge-m3 via Ollama); only the one-off reranking of retrieved passages used the Gemini API (gemini-3.5-flash-lite), and its output is cached. Say so in Methods.

## Figures
- Diagrams: TikZ in `figures/*.tex`. Charts: scripts that read results JSON and export vector PDF to `figures/`.

## Plagiarism
- Claude cannot run a true plagiarism check. Final check: university Turnitin/iThenticate.
- On request, compare the draft against source papers the user provides and flag close paraphrases.
