# Motrix 2.4.2 — macOS 12 + ED2K Edition

English | [简体中文](./README.zh-CN.md)

This repository is a fork of [agalwood/Motrix](https://github.com/agalwood/Motrix) v2.4.2. Original author: Dr_rOot / agalwood. Original license: MIT.

It combines the macOS 12 compatibility fixes from `motrix-macos12` with ED2K link recognition and an ED2K-capable download engine.

## What is actually implemented

| Item | Upstream 2.4.2 | motrix-macos12 | This repository |
| --- | --- | --- | --- |
| Runs on macOS 12 | No | Yes | Yes |
| ED2K link recognized | No (`unsupportedProtocol`) | No | Yes |
| ED2K task accepted by engine | No | No | Yes (aria2-next 3.1.0) |
| ED2K bytes transferred | Depends on peers | No | Depends on online sources for the hash |

The last row is important. We verified that the ED2K task is accepted by the engine and that `aria2.tellActive` returns `hash`, `name`, `length`, `serverCount` and `kadNodeCount`. We also verified connection to the eD2k server/Kad network. The specific Office ISO link previously provided was tested with `--dry-run` and reported `CN:0`, meaning no online source was found; therefore it shows 0 B/s in any client, including aMule.

## Changes

1. Added `src/shared/lib/ed2k-link.ts`: strict eD2k file/server/serverlist parsing with precise diagnostics.
2. Added `ed2k` to every protocol allowlist in source admission, task creation, plugin hooks, recovery and session restore. Missing any one of these layers caused the `unsupportedProtocol` error.
3. Replaced the bundled aria2 with `aria2-next` 3.1.0 (native eD2k support).
4. `ed2k-engine/aria2c-wrapper.sh` filters three unsupported SQLite options, normalizes `--version`, loads `server.met` and `nodes.dat`, adds active eD2k servers, and enables multithreaded settings: `--split=16 --max-connection-per-server=16 --min-split-size=1M --ed2k-max-connections=200`.
5. Patched the compiled `app.asar` so a packaged app, not only the TypeScript source, accepts ED2K links.
6. Kept all macOS 12 compatibility patches from `motrix-macos12`.

See [CHANGELOG-ED2K.md](./CHANGELOG-ED2K.md) for the file-by-file list.

## Verification performed

- 64 ED2K-related unit tests pass (`ed2k-link`, `download-source`, `source-admission`).
- `tsc --noEmit` and Biome checks pass.
- On macOS 12.7.6, the app launches, the engine reports ready, and `aria2-next` runs with the configured server and Kad lists.
- `serverCount=28`, `connectedServerCount=1`, `kadNodeCount≈75` were observed via RPC.
- The new-task dialog accepts an ED2K link; the engine accepted the task, and the RPC record contained full ED2K metadata.
- The provided Office ISO link was **not** downloaded. It is commercial software and was only used as a format test case. A dry run reported `CN:0`.

## Download and usage

Download `Motrix-2.4.2-ed2k-macos12-x64.dmg` from this repository's Releases, open it, and copy Motrix to Applications. If Gatekeeper blocks it, right-click and choose Open.

Do not use in-app auto-update; it will overwrite the patched files.

From source:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm exec vitest run src/shared/lib/ed2k-link.test.ts src/shared/lib/download-source.test.ts src/core/task/source-admission.test.ts
```

## Windows port

See [ED2K-WINDOWS-PATCH.md](./ED2K-WINDOWS-PATCH.md) and [PROMPTS_FOR_WINDOWS.md](./PROMPTS_FOR_WINDOWS.md). Chinese versions: [ED2K-WINDOWS-PATCH.zh-CN.md](./ED2K-WINDOWS-PATCH.zh-CN.md) and [PROMPTS_FOR_WINDOWS.zh-CN.md](./PROMPTS_FOR_WINDOWS.zh-CN.md). The same material is also in `\\192.168.1.248\公共空间\ed2k\`.

## License

Motrix source and our patches: MIT License (see `LICENSE` and `ATTRIBUTION.md`). The bundled `aria2-next` engine is GPL-2.0; see `THIRD_PARTY_NOTICES.md`.

## Cold resources and "Xunlei-like" speed

Xunlei uses its own central index and offline/cache servers. A pure eD2k client cannot reproduce that. For a cold hash, observed behaviour was:

- UPnP port mapping failed with error 501, so the client is LowID / Kad-firewalled.
- Kad source lookup returned 8 timeouts and 0 results.
- `ed2k.shortypower.org` showed only 4 historical sources on 3 servers.

Use `ed2k-engine/source-lookup.py 'ed2k://...' --servers` to query historical availability and get the matching server list. Add those servers to the wrapper. Manually forwarding TCP 4662 / UDP 4672 on the router is required to become HighID; without it, inbound peers remain blocked.

## Per-task ED2K sharing ratio

Right-click an ED2K task in the Downloads list and choose **ED2K 分享比例**. Options: unlimited, no sharing (stop upload after completion), 1:1, 1.5:1, 2:1, 3:1 and 5:1. The app stores the choice in `ed2k-sharing.json` under the Motrix user-data directory and checks every 10 seconds using `uploadLength` from aria2-next. When the ratio is reached, the engine task is removed while the downloaded file remains.

This implements "download as much as you give back" per task. eD2k already has a credit system, but aria2-next does not expose a per-task eD2k ratio option, so the fork enforces it at the application layer.

Speed note: Xunlei's 10–20 MB/s comes from its central cache and CDN, not from public eD2k. Open eD2k speed depends on live sources and upload bandwidth. This fork cannot create sources that do not exist.
