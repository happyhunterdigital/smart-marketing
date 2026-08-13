---
name: openmontage
description: Agent-first AI video production via the local OpenMontage repo (C:\Users\ratik\Documents\GitHub\OpenMontage). Use when the user wants to create, edit, generate, render, or repurpose any video — explainers, trailers, cinematic teasers, animated/motion-graphics shorts, documentary montages from stock footage, talking-head/screen-demo clips, podcast highlights, localization/dubbing, batch social clips — or mentions OpenMontage, Remotion/HyperFrames composition, or the Backlot storyboard. Runs the full pipeline (research, script, assets, narration, music, captions, compose, render) with human approval gates before any spend.
---

# OpenMontage — Agentic Video Production (local install)

Source of truth: `C:\Users\ratik\Documents\GitHub\OpenMontage` (cloned repo, AGPL-3.0).

**Python venv**: `C:\Users\ratik\Documents\GitHub\OpenMontage\.venv\Scripts\python.exe`
**FFmpeg**: 9.0 on machine PATH. **Remotion**: deps installed in `remotion-composer\`.

> The repo's `AGENTS.md` enforces reading `AGENT_GUIDE.md` — honor it for any work *inside* that repo. This skill is the external entry point.

## Entry rules

1. **Reference video given** ("make something like this YouTube/TikTok/clip") → read `.agents\skills\video-reference-analyst.md` analysis flow first, then propose 2–3 differentiated concepts.
2. **Any video request** → treat as pipeline selection. Pick from `pipeline_defs\` (12 pipelines: `animated-explainer`, `animation`, `character-animation`, `cinematic`, `clip-factory`, `documentary-montage`, `hybrid`, `talking-head`, `screen-demo`, `podcast-repurpose`, `avatar-spokesperson`, `localization-dub`). Read that YAML, then the stage director skills under `skills\pipelines\<pipeline>\<stage>-director.md`.
3. **Preflight before promising anything** (run from repo root):
   ```powershell
   cd C:\Users\ratik\Documents\GitHub\OpenMontage
   .\.venv\Scripts\python.exe -c "from tools.tool_registry import registry; registry.discover(); print(registry.provider_menu_summary())"
   ```
   Present "X of Y capabilities configured." Never dump the raw envelope.
4. **Respect Layer-3 skills**: tools with `agent_skills` must read matching `.agents\skills\<skill>\SKILL.md` before calling.
5. **Governance**: proposal/script/scene-plan gates pause for approval; `render_runtime` (remotion/hyperframes) is locked at proposal and must not silently swap. Budget caps enforced by `tools\cost_tracker.py`.

## Running tools from another project

Always `workdir` to the OpenMontage repo root before invoking its Python tools or it will fail to import `tools` / load `.env` / write `projects\`. Example PowerShell pattern:
```powershell
Set-Location C:\Users\ratik\Documents\GitHub\OpenMontage
.\.venv\Scripts\python.exe -c "from tools.tool_registry import registry; registry.discover(); t=registry.get('piper_tts'); print(t.execute({'text':'hello','output_path':'projects/demo/assets/audio/vo.wav'}).to_dict())"
```
Per-production state lives in `OpenMontage\projects\<project-name>\{artifacts,assets,renders}`.

## Live storyboard (optional)
Start the Backlot board to watch stages fill live:
```powershell
cd C:\Users\ratik\Documents\GitHub\OpenMontage
.\.venv\Scripts\python.exe -m backlot open <project-name>
```
Or list all boards: `.\.venv\Scripts\python.exe -m backlot open` (library).

## Environment notes (Windows)

- Set `PYTHONUTF8=1` and UTF-8 output before printing registry summaries (cp1252 errors): `$env:PYTHONUTF8="1"; chcp 65001`.
- Remotion first render may require approving esbuild's npm install script:
  `cd remotion-composer; npx install-scripts approve esbuild` (or re-run `npm install`).
- Zero API keys available now → Piper TTS + Archive.org/NASA/Wikimedia/Pixabay music still work. Keys go in `OpenMontage\.env`.

## Cost & license
- No keys = free/offline (Piper, stock footage, Remotion). Paid keys are opt-in and show cost per video.
- AGPL-3.0: use locally is free; if you modify OpenMontage code and offer it as a network service to others, you must offer the modified source.

## Pointers
- Full contract: `C:\Users\ratik\Documents\GitHub\OpenMontage\AGENT_GUIDE.md`
- Architecture: `PROJECT_CONTEXT.md`, `skills\INDEX.md`, `docs\ARCHITECTURE.md`
- All tech/vendor knowledge packs: `.agents\skills\` (83 entries)
