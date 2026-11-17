<div align="center">

<img src="./public/app-icon.png" alt="Motrix ED2K" width="128" />

# Motrix 2.4.2 · ED2K Edition

**A macOS 12-compatible Motrix fork with native ED2K recognition, an aria2-next engine, and reciprocal per-task sharing.**

[![Platform](https://img.shields.io/badge/platform-macOS%2012%2B-blue.svg)](#requirements)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Engine](https://img.shields.io/badge/engine-aria2--next%203.1.0-orange.svg)](./ed2k-engine)
[![Tests](https://img.shields.io/badge/ED2K%20tests-35%20passing-brightgreen.svg)](#verification)

English | [简体中文](./README.zh-CN.md)

</div>

---

## Overview

This project is a focused fork of [agalwood/Motrix](https://github.com/agalwood/Motrix) v2.4.2. It keeps Motrix's desktop experience and adds the two things upstream deliberately does not provide: **ED2K link admission** and **an engine that actually speaks eD2k**.

It is built for macOS 12 Monterey, which is the last macOS release supported by many Intel Macs. The original 2.4.2 build does not launch there; this fork keeps the macOS 12 compatibility patches and adds ED2K support on top.

> This is an independent community fork. It is not affiliated with the Motrix upstream project, Microsoft, or Xunlei.

## Features

| Feature | Status |
| --- | --- |
| ED2K file, server and serverlist links | Parsed and admitted through every Motrix layer |
| ED2K engine | Bundled `aria2-next 3.1.0` with eD2k/Kad support |
| Server and Kad bootstrap | `server.met` + `nodes.dat`, refreshed active-server list |
| Multi-threaded transfer | 16-way split, 200 eD2k connections, 1 MiB minimum split |
| Per-task sharing ratio | Right-click a task, choose 0–10× the file size with a slider |
| Global sharing switch | Settings → BitTorrent → ED2K 分享 |
| HTTP / HTTPS / FTP / BT / Magnet | Preserved from upstream |
| macOS 12 compatibility | Preserved from `motrix-macos12` |

## Screenshots

<p align="center">
  <img src="./screenshots/motrix-downloads-en-light.webp" alt="Downloads" width="820" />
</p>

<p align="center">
  <img src="./screenshots/motrix-settings-en-light.webp" alt="Settings" width="820" />
</p>

## Requirements

- macOS 12.0 or later (tested on macOS 12.7.6, Intel x64)
- An internet connection that permits eD2k traffic
- For best eD2k performance: a reachable TCP/UDP port (see [Network](#network-and-speed))

## Install

1. Download the four `.part-*` files from [Releases](../../releases).
2. Join them: `cat Motrix-2.4.2-ed2k-macos12-x64.dmg.part-* > Motrix-2.4.2-ed2k-macos12-x64.dmg`.
3. Open the DMG and drag **Motrix ED2K** into **Applications**.
3. On first launch, right-click the app and choose **Open** if Gatekeeper blocks it.

The build is ad-hoc signed, not notarized. Do not enable in-app auto-update; it would replace the patched engine.

## Use

### Download an ED2K file

Paste an `ed2k://|file|...|/` link into **New Task → Links**. The app validates the hash and size, admits the task, and hands it to aria2-next.

### Share back

Open **Settings → BitTorrent → ED2K 分享** and keep **为 ED2K 资源提供带宽** enabled. Then right-click any ED2K task:

- slider **0** — stop uploading after the download completes
- slider **0.5** — default; upload 50% of the downloaded bytes
- slider **1–10** — upload 1× to 10× the file size
- **不限** — keep seeding without a ratio limit

For a 1 GB file, 0.5 means a 0.5 GB target, 1 means 1 GB, 10 means 10 GB. The monitor checks every 10 seconds and removes the engine task at the target without deleting the downloaded file.

## Network and speed

eD2k is peer-to-peer. Speed is determined by **live sources**, their upload bandwidth, and whether your client is reachable. Xunlei's 10–20 MB/s comes from its own central cache and CDN; a public eD2k client cannot reproduce that.

Run the built-in diagnostic while the app is running:

```bash
python3 ed2k-engine/diagnose.py
```

It prints the live RPC view: connected servers, LowID, Kad nodes, port mapping, and per-task peer counts.

Measured on the development machine:

```
lowId: true
kadFirewalled: true
portMapping: off
connectedServerCount: 1
peerCount: 0   # for the paused test task
```

That is a network/source condition, not a connection-cap bug. For a better chance of HighID, forward **TCP 4662** and **UDP 4672** to the Mac's LAN address on the router. UPnP returned error 501 on the test router, so automatic mapping is disabled.

## Build from source

```bash
corepack pnpm install --frozen-lockfile

# Type check and focused tests
corepack pnpm exec tsc --noEmit
corepack pnpm exec vitest run \
  src/shared/lib/ed2k-link.test.ts \
  src/shared/lib/download-source.test.ts \
  src/core/task/source-admission.test.ts \
  src/core/task/ed2k-sharing.test.ts \
  src/core/engine/aria2/feature-report.test.ts

# Build the Electron bundles
corepack pnpm run build:electron
corepack pnpm exec node scripts/stage-electron-app.mjs --platform darwin --arch x64
```

The engine lives in `ed2k-engine/`. See [`ed2k-engine/README.md`](./ed2k-engine/README.md) for the wrapper, server list, Kad list and diagnostic tool.

## Architecture

```
Motrix renderer / main process
        │  ED2K admission + per-task sharing policy
        ▼
  aria2-next 3.1.0
        │  eD2k + Kad protocol
        ▼
  server.met / nodes.dat / peers
```

The fork does not reimplement eD2k. It removes Motrix's protocol whitelist blocks, ships a native eD2k engine, bootstraps the network, and adds the sharing policy at the application layer.

## Verification

- 36 ED2K-focused tests pass.
- `tsc --noEmit` passes.
- Biome check passes on changed files.
- On macOS 12.7.6 the app launches, aria2-next starts with server and Kad lists, and the ED2K task is accepted with full `ed2k` metadata.
- The false "non-Motrix aria2" warning is gone; `aria2-next` / `3.1.0-motrix-ed2k` is recognized as a supported engine.

## Known limitations

- eD2k speed cannot exceed the available live sources. A cold hash can remain at 0 B/s in every open client.
- UPnP may fail on some routers (error 501 was observed); manual port forwarding is required for HighID.
- The bundled engine is GPL-2.0; the Motrix source and this fork's patches are MIT.
- macOS 12 login-item registration is inherited from the base compatibility patch and remains unavailable.

## Credits and license

- Upstream: [agalwood/Motrix](https://github.com/agalwood/Motrix), MIT.
- macOS 12 base: `motrix-macos12`.
- eD2k engine: [aria2-next](https://github.com/AnInsomniacy/aria2-next), GPL-2.0.
- Server/Kad data: `upd.emule-security.org` and the Telemacore active-server list.

See [`LICENSE`](./LICENSE), [`ATTRIBUTION.md`](./ATTRIBUTION.md), and [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

## Dashboard contribution

The dashboard's transfer tile shows **ED2K 已贡献** with the lifetime total uploaded by ED2K tasks. Click it to open a detail dialog with:

- total contributed bytes
- a day-by-day breakdown
- the top tasks that received your upload for each day

The counter is updated by the same 10-second monitor that enforces sharing ratios. It is stored in `ed2k-contribution.json` under the Motrix user-data directory and keeps 90 days of history.

## ED2K names and finalization

An ED2K link is not a URL, so it must not go through `new URL()`. The app extracts and percent-decodes the file name from the link, then uses it for the `.motrix` temporary file and the final rename. Finalization also accepts aria2-next's `GID <gid>` error text, so a completed download cannot stall at the temporary file.
