# ED2K edition — change list

Base: this branch is built on the `motrix-macos12` source, itself based on upstream Motrix v2.4.2 (`c601dcf`).

## Changes relative to upstream Motrix 2.4.2

| Area | File(s) | Change |
| --- | --- | --- |
| ED2K parser | `src/shared/lib/ed2k-link.ts` (new) | Strict eD2k file/server/serverlist parsing, precise diagnostics. |
| ED2K parser tests | `src/shared/lib/ed2k-link.test.ts` (new) | 17 tests covering common formats and malformed inputs. |
| Source admission | `src/shared/lib/download-source.ts`, `src/shared/schemas/download-source.ts`, `src/core/task/source-admission.ts` | Add `ed2k` protocol, `invalidEd2k` diagnostic, ED2K branch. |
| Source admission tests | `src/shared/lib/download-source.test.ts` | 45 tests including ED2K valid/invalid cases. |
| Download engine | `ed2k-engine/install-engine.sh`, `ed2k-engine/aria2c-wrapper.sh` | Replace bundled aria2 with aria2-next 3.1.0; filter unsupported SQLite options; normalize `--version` output. |
| Packaging | built `app.asar` in the DMG | Inject the same ED2K recognition logic into the shipped compiled bundle. |
| Documentation | `FORK-README.md`, `CHANGELOG-ED2K.md`, `THIRD_PARTY_NOTICES.md`, `PROMPTS_FOR_WINDOWS.md` | Explain usage, changes and Windows porting prompts. |

## Changes relative to `motrix-macos12`

- Adds all ED2K recognition/testing code above.
- Replaces the bundled `aria2c` with the `aria2-next` engine plus wrapper.
- Leaves the macOS 12 compatibility patches unchanged.

## Known limitations

- aria2-next is GPL-2.0; the MIT license applies to Motrix source and our patches only.
- eD2k download speed depends on server/Kad availability and peers.
- Login-item registration remains unavailable on macOS 12 (from the base compatibility patch).
