<div align="center">

<img src="./public/app-icon.png" alt="Motrix ED2K" width="128" />

# Motrix 2.4.2 · ED2K 版

**macOS 12 可用的 Motrix 分支：真正能下 eD2k，保留原始文件名，并按任务回馈分享。**

[![平台](https://img.shields.io/badge/平台-macOS%2012%2B-blue.svg)](#系统要求)
[![基础](https://img.shields.io/badge/基础-Motrix%202.4.2-lightgrey.svg)](https://github.com/agalwood/Motrix)
[![引擎](https://img.shields.io/badge/引擎-aria2--next%203.1.0-orange.svg)](./ed2k-engine)
[![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)](./LICENSE)
[![测试](https://img.shields.io/badge/测试-387%20通过-brightgreen.svg)](#验证)

[English](./README.md) | 简体中文

</div>

---

## 这个版本是什么

这是 [agalwood/Motrix](https://github.com/agalwood/Motrix) v2.4.2 面向 macOS 12 Monterey 的分支。保留 Motrix 的桌面体验，补上上游没有的两件事：**ED2K 链接准入** 和 **真正支持 eD2k 的下载引擎**。

它不是换个皮肤，也不会假装一个死种能下载。应用会解析链接、提取真实文件名、连接 eD2k 服务器和 Kad，最后按链接里的名字写出完整文件。

> 独立社区分支，与 Motrix 上游、Microsoft、迅雷均无隶属关系。

| 版本 | macOS 12 | ED2K | 适合谁 |
| --- | --- | --- | --- |
| [macOS 12 兼容版](https://github.com/a2109246162-tech/motrix-macos12) | ✅ | ❌ | 需要原版 Motrix 功能、系统停在 Monterey 的用户 |
| **ED2K 版**（本仓库） | ✅ | ✅ | 同时需要 ED2K 链接、分享和贡献统计的 Monterey 用户 |

## 下载的到底是什么

一个 ED2K 文件链接长这样：

```
ed2k://|file|deepin-desktop-community-25.2.0-amd64.iso|6976131072|ED2B0112...|/
```

添加之后：

1. 先校验链接，并从链接里提取 **文件名**，做百分号解码。不会走 `new URL()`，因为 ED2K 链接不是 URL。
2. aria2-next 拿到链接，向已连接的服务器和 Kad 查询这个 hash 的源。
3. 下载中的文件写成 `<原文件名>.motrix`。
4. 完成后校验、重命名为 `<原文件名>`，在下载列表里显示为正常文件。

名称和扩展名都会保留。实测一个 3.3 MB 的 ED2K PDF，最终得到：

```
[Wiley] Ubuntu Linux Toolbox 1000+ Commands for Ubuntu & Debian Power Users.pdf
PDF document, version 1.6
```

如果 hash 没有活源，任务会停在 **0 B/s、0 个 peer**。这是网络状态，不是应用偷偷限速。实测中，老的 Deepin 20.5 已经 0 源；Ubuntu 20.04 能连上 11 个 peer，LowID 下大约 100–200 KB/s。

## 功能

| 功能 | 状态 |
| --- | --- |
| ED2K 文件、服务器、服务器列表链接 | 通过 Motrix 各层准入并解析 |
| ED2K 引擎 | 内置 `aria2-next 3.1.0`，原生支持 eD2k/Kad |
| 服务器与 Kad 引导 | `server.met` + `nodes.dat`，附带活跃服务器列表 |
| 多线程传输 | 16 分块、200 个 eD2k 连接、最小分块 1 MiB |
| 原始文件名 | 从链接提取、百分号解码、保留扩展名 |
| 每任务分享比例 | 右键任务，用滑轨选择 0–10 倍文件大小 |
| 全局分享开关 | 设置 → BitTorrent → ED2K 分享 |
| 贡献仪表盘 | 累计总量、按天明细、每天贡献最多的任务 |
| HTTP / HTTPS / FTP / BT / Magnet | 保留上游能力 |
| macOS 12 兼容 | 保留 `motrix-macos12` 补丁 |

## 界面

<p align="center">
  <img src="./screenshots/motrix-downloads-cn-light.webp" alt="下载列表" width="820" />
</p>

<p align="center">
  <img src="./screenshots/motrix-settings-cn-light.webp" alt="设置" width="820" />
</p>

## 系统要求

- macOS 12.0 或更高（已在 macOS 12.7.6、Intel x64 实测）
- Intel Mac；本包是 `x64`
- 允许 eD2k 流量出站的网络
- 想要更好的 peer 连接：需要可达的 TCP/UDP 端口

## 安装

1. 从 [Releases](../../releases) 下载四个 `.part-*` 分片。
2. 合并：

   ```bash
   cat Motrix-2.4.2-ed2k-macos12-x64.dmg.part-* \
     > Motrix-2.4.2-ed2k-macos12-x64.dmg
   ```

3. 打开 DMG，把 **Motrix ED2K** 拖进「应用程序」。
4. 首次启动如被 Gatekeeper 拦截，右键应用选择「打开」。

本构建使用 ad-hoc 签名，未做公证。不要开启应用内自动更新，否则会覆盖修补后的引擎和 macOS 12 二进制。

## 使用

### 添加 ED2K 文件

把 `ed2k://|file|...|/` 链接粘贴到 **新建任务 → 链接**。链接、大小和 hash 校验通过后才会接受任务。

### 回馈分享

打开 **设置 → BitTorrent → ED2K 分享**，保持 **为 ED2K 资源提供带宽** 开启。然后右键任意 ED2K 任务：

- **0**：下载完成后停止上传
- **0.5**：默认值，上传下载量的 50%
- **1–10**：上传文件大小的 1 到 10 倍
- **不限**：不设比例上限，一直做种

例如 1 GB 文件：0.5 表示目标上传 0.5 GB，1 表示 1 GB，10 表示 10 GB。监控器每 10 秒检查一次，达标后移除引擎任务，但不删除已下载文件。

## 源与速度

eD2k 是点对点网络。速度取决于**实时在线源**、对方上传带宽，以及你的客户端是否可达。迅雷的十几二十 MB/s 来自它自己的中心缓存和 CDN，公开 eD2k 客户端无法复刻。

应用运行时可直接运行内置诊断：

```bash
python3 ed2k-engine/diagnose.py
```

它会打印已连服务器、是否 LowID、Kad 节点、端口映射和每任务 peer 数。

开发机实测：

```
lowId: true
kadFirewalled: true
portMapping: off
connectedServerCount: 1
```

要争取 HighID，需要在路由器把 **TCP 4662**、**UDP 4672** 转发到这台 Mac 的局域网地址。测试路由器 UPnP 返回 501，因此自动映射已关闭。

如果任务几分钟都是 `0 peers`，说明这个 hash 已经冷门。换当前还有源的链接，不要期待 2022 年的 ISO 永远有人做种。

## 仪表盘贡献

传输卡片会一直显示 **ED2K 已贡献 · 详情**，总流量为 0 B 时也显示。点击后打开：

- 累计贡献总量
- 按天拆分
- 每天贡献最多的前 3 个任务

计数由执行分享比例的同一个 10 秒监控器更新，保存在 Motrix 用户数据目录的 `ed2k-contribution.json`，保留最近 90 天。

## 文件名与最终化

这两个细节很容易做错，现在都有回归测试：

- **名称**：`ed2kLinkFilename()` 从链接提取并解码文件名。创建任务时用它生成引擎 `out`、`.motrix` 临时文件和最终重命名。
- **最终化**：aria2-next 报的是 `Could not remove download result of GID <gid>`，没有 `#`。适配器同时接受这种写法和旧的 `GID#<gid>`，然后重试。不修的话，下载完成会卡在 `.motrix`。

## 架构

```
Motrix 渲染进程 / 主进程
        │  ED2K 准入 + 每任务分享 + 贡献统计
        ▼
  aria2-next 3.1.0
        │  eD2k + Kad 协议
        ▼
  server.met / nodes.dat / peers
```

本分支没有重新实现 eD2k。它做的是：移除 Motrix 各层协议白名单阻塞、内置原生 eD2k 引擎、补上网络引导、保留文件名，并在应用层实现分享和贡献策略。

## 从源码构建

```bash
corepack pnpm install --frozen-lockfile

corepack pnpm exec tsc --noEmit
corepack pnpm exec vitest run \
  src/shared/lib/ed2k-link.test.ts \
  src/shared/lib/download-source.test.ts \
  src/core/task/source-admission.test.ts \
  src/core/task/ed2k-sharing.test.ts \
  src/core/engine/aria2/feature-report.test.ts \
  src/core/task/create-task-handler.test.ts \
  src/core/engine/aria2/aria2-adapter.test.ts \
  src/renderer/routes/dashboard/tiles/transfer-tile.test.tsx

corepack pnpm run build:electron
corepack pnpm exec node scripts/stage-electron-app.mjs --platform darwin --arch x64
```

引擎相关文件在 `ed2k-engine/`，说明见 [`ed2k-engine/README.md`](./ed2k-engine/README.md)。

## 验证

- 387 个聚焦测试通过。
- `tsc --noEmit` 通过。
- 改动文件通过 Biome 检查。
- ED2K 端到端实测：3.3 MB PDF 完成，按原文件名最终化，`file` 返回 `PDF document, version 1.6`。
- 活源实测：Ubuntu 20.04 连上 11 个 peer，速度约 100–200 KB/s；死种 Deepin 20.5 始终 0 peer。
- macOS 12.7.6 启动正常，aria2-next 带服务器/Kad 列表运行，任务详情把 ED2K 任务标为 `ED2K`。

## 已知限制

- eD2k 速度不会超过可用在线源；冷门 hash 在任何开源客户端里都可能是 0 B/s。
- LowID 会限制入站连接。路由器 UPnP 失败时，需要手动端口转发才能 HighID。
- 内置引擎为 GPL-2.0；Motrix 源码与本分支补丁为 MIT。
- macOS 12 登录项注册不可用，继承自基础兼容补丁。
- 构建使用 ad-hoc 签名，未公证。

## 致谢与许可证

- 上游：[agalwood/Motrix](https://github.com/agalwood/Motrix)，MIT。
- macOS 12 基础：[motrix-macos12](https://github.com/a2109246162-tech/motrix-macos12)。
- eD2k 引擎：[aria2-next](https://github.com/AnInsomniacy/aria2-next)，GPL-2.0。
- 服务器/Kad 数据：`upd.emule-security.org` 与 Telemacore 活跃服务器列表。

见 [`LICENSE`](./LICENSE)、[`ATTRIBUTION.md`](./ATTRIBUTION.md)、[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。
