# ED2K Edition — Changelog (English)

[简体中文](./CHANGELOG-ED2K.zh-CN.md)

Base: upstream Motrix v2.4.2 (`c601dcf`), with the macOS 12 compatibility patches from `motrix-macos12`.

## Changes

| Area | Files | What changed |
| --- | --- | --- |
| ED2K parser | `src/shared/lib/ed2k-link.ts` (new) | Strict parsing of eD2k file/server/serverlist links with precise diagnostics. |
| Parser tests | `src/shared/lib/ed2k-link.test.ts` (new) | 17 tests covering valid formats and malformed inputs. |
| Source analysis | `src/shared/lib/download-source.ts`, `src/shared/schemas/download-source.ts` | Added `ed2k` protocol and diagnostic; ED2K branch in `analyzeDownloadSource`. |
| Admission | `src/core/task/source-admission.ts` (+ `.test.ts`) | Added `ed2k` to default allowlist and to `admitTaskCreateRequest`; tests assert ED2K requests are accepted. |
| Task creation | `src/core/task/create-task-handler.ts` | Added `ed2k` to input and both plugin-hook allowlists. |
| Recovery | `src/core/task/actions/re-add-task.ts`, `src/core/session/session-manager.ts` | Added `ed2k` to recovery allowlists. |
| Plugin hooks | `src/core/plugin/hooks/hook-orchestrator.ts` | Added `ed2k` to plugin allowlist. |
| Engine | `ed2k-engine/aria2c-wrapper.sh`, `ed2k-engine/install-engine.sh` | Replaced aria2 with aria2-next 3.1.0; filter SQLite options; normalize `--version`; load `server.met` / `nodes.dat`; add active servers; enable 16-way split and 200 ED2K connections. |
| Network bootstrap | `ed2k-engine/server.met`, `nodes.dat`, `servers.json` | eD2k server/Kad lists from upd.emule-security.org and Telemacore. |
| Packaged app | `app.asar` in the DMG | Injected the same ED2K logic into the compiled main/renderer bundles; fixed minified-code differences (`dv` vs `Tt`, `n=[...]` vs `t=[...]`, `ba([...])` enum). |
| Docs | README (EN/ZH), this changelog (EN/ZH), Windows patch/prompts (EN/ZH), `ATTRIBUTION.md`, `THIRD_PARTY_NOTICES.md` | Describe verified behaviour and limitations. |

## Verification

- 64 ED2K-related tests pass; `tsc --noEmit` and Biome pass.
- macOS 12.7.6: app and engine start; RPC `serverCount=28`, `connectedServerCount=1`, `kadNodeCount≈75`.
- The Office ISO link supplied by the user was only used as a format test case; a dry run reported `CN:0` (no online source). It was not downloaded.

## Known limitations

- Actual transfer speed depends entirely on online peers for the file hash. With `CN:0`, 0 B/s is expected in any client.
- The bundled `aria2-next` is GPL-2.0; MIT applies only to the Motrix source and this fork's patches.
- Login-item registration is unavailable on macOS 12 (inherited from the base compatibility patch).

## Cold-resource diagnostics

- Added `ed2k-engine/source-lookup.py` to query historical eD2k availability and print matching `ip:port` servers.
- Added servers reported for the previously supplied hash (`eMule Sunrise`, `Astra-3`, `MO-ad-free`) to the wrapper.
- Disabled UPnP in the wrapper because it returns error 501; manual router forwarding is documented.

## Per-task sharing

- Added `src/core/task/ed2k-sharing.ts`: per-task ratio store and a 10-second monitor using aria2-next `uploadLength`.
- Added `command:setEd2kShareRatio` IPC command and a right-click **ED2K 分享比例** submenu on ED2K tasks.
- Options: unlimited, 0 (stop upload after completion), 1, 1.5, 2, 3, 5. Reaching the target removes the engine task and keeps the file.

## Final sharing UX and engine identity

- Added `engine.ed2kShareBandwidth` setting (default true) and a switch in Settings.
- Per-task slider 0–10 (0.1 step) with presets 0.5/1/2/10/unlimited; default 0.5.
- Monitor applies the global switch, then the per-task ratio, to every ED2K task.
- Recognised `aria2-next` / `3.1.0-motrix-ed2k` as a supported engine, removing the false non-Motrix aria2 warning and the 16-connection cap.

## Speed diagnostics

- Added `ed2k-engine/diagnose.py` for live RPC inspection of LowID, server/Kad counts, port mapping and per-task peer counts.
- Documented the measured state: LowID, Kad firewalled, UPnP off, one connected server, zero peers for the paused task.
