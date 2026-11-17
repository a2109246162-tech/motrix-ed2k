# Motrix 2.4.2 — macOS 12 + ED2K 版

[English](./README.md) | 简体中文

本仓库基于 [agalwood/Motrix](https://github.com/agalwood/Motrix) v2.4.2。原作者：Dr_rOot / agalwood，原项目许可证：MIT。

它把 `motrix-macos12` 的 macOS 12 兼容修复，与 ED2K 链接识别、支持 ED2K 的下载引擎合并在一起。

## 实际做到的事情

| 项目 | 原版 2.4.2 | motrix-macos12 | 本仓库 |
| --- | --- | --- | --- |
| 在 macOS 12 运行 | 否 | 是 | 是 |
| ED2K 链接识别 | 否（报 unsupportedProtocol） | 否 | 是 |
| ED2K 任务被引擎接受 | 否 | 否 | 是（aria2-next 3.1.0） |
| ED2K 字节传输 | 取决于是否有源 | 否 | 取决于该 hash 是否有在线源 |

最后一行很重要。我们验证过：ED2K 任务会被引擎接受，`aria2.tellActive` 返回完整的 `hash`、`name`、`length`、`serverCount`、`kadNodeCount`；也验证了 eD2k 服务器与 Kad 网络连接正常。之前提供的 Office ISO 链接只做了 `--dry-run` 测试，结果是 `CN:0`，即当前网络找不到在线源；这种情况下任何客户端（包括 aMule）都会显示 0 B/s。

## 改动内容

1. 新增 `src/shared/lib/ed2k-link.ts`，严格解析 eD2k file/server/serverlist 链接并给出精确诊断。
2. 在源码准入、任务创建、插件钩子、恢复和会话恢复的**每一层**白名单里加入 `ed2k`。漏掉任何一层都会报"此下载不支持 URL 协议"。
3. 把内置 aria2 换成 `aria2-next` 3.1.0（原生支持 eD2k）。
4. `ed2k-engine/aria2c-wrapper.sh` 过滤 3 个不支持的 SQLite 参数、规范化 `--version`、加载 `server.met` 与 `nodes.dat`、加入活跃服务器，并开启多线程：`--split=16 --max-connection-per-server=16 --min-split-size=1M --ed2k-max-connections=200`。
5. 同时修改打包后的 `app.asar`，让安装包本身（而不只是 TypeScript 源码）也能识别 ED2K。
6. 保留 `motrix-macos12` 的全部 macOS 12 兼容补丁。

逐文件清单见 [CHANGELOG-ED2K.zh-CN.md](./CHANGELOG-ED2K.zh-CN.md)。

## 已执行的验证

- 64 个 ED2K 相关单元测试通过（`ed2k-link`、`download-source`、`source-admission`）。
- `tsc --noEmit` 与 Biome 检查通过。
- macOS 12.7.6 实机启动正常，引擎就绪，`aria2-next` 带服务器和 Kad 列表运行。
- RPC 观测到 `serverCount=28`、`connectedServerCount=1`、`kadNodeCount≈75`。
- 新建任务窗口接受 ED2K 链接，引擎接受任务，RPC 记录含完整 ED2K 元数据。
- **没有**下载用户提供的 Office 镜像；它是商业软件，只作为格式测试样例。干跑结果 `CN:0`。

## 下载与使用

从本仓库 Releases 下载 `Motrix-2.4.2-ed2k-macos12-x64.dmg`，打开后把 Motrix 拖进"应用程序"。如被 Gatekeeper 拦截，右键 →「打开」。

不要使用应用内自动更新，更新会覆盖补丁。

从源码验证：

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm exec vitest run src/shared/lib/ed2k-link.test.ts src/shared/lib/download-source.test.ts src/core/task/source-admission.test.ts
```

## Windows 移植

见 [ED2K-WINDOWS-PATCH.zh-CN.md](./ED2K-WINDOWS-PATCH.zh-CN.md) 与 [PROMPTS_FOR_WINDOWS.zh-CN.md](./PROMPTS_FOR_WINDOWS.zh-CN.md)。英文版：[ED2K-WINDOWS-PATCH.md](./ED2K-WINDOWS-PATCH.md)、[PROMPTS_FOR_WINDOWS.md](./PROMPTS_FOR_WINDOWS.md)。同样的资料也放在 `\\192.168.1.248\公共空间\ed2k\`。

## 许可证

Motrix 源码与我们的补丁：MIT License（见 `LICENSE`、`ATTRIBUTION.md`）。随包 `aria2-next` 引擎为 GPL-2.0，见 `THIRD_PARTY_NOTICES.md`。

## 冷门资源与"迅雷那种效果"

迅雷有自己的中心化索引和离线/缓存服务器，纯 eD2k 客户端无法复刻。对冷门 hash 实测到：

- 路由器 UPnP 返回 501，端口映射失败，客户端处于 LowID / Kad 被防火墙隔离状态。
- Kad 查源 8 个节点全部超时，0 结果。
- `ed2k.shortypower.org` 只显示 3 台服务器上的 4 个历史源。

可用 `ed2k-engine/source-lookup.py 'ed2k://...' --servers` 查询历史可用性和对应服务器，并把结果加入包装脚本。要在路由器手动转发 TCP 4662 / UDP 4672 才能变成 HighID；否则入站连接始终受限。

## 每任务 ED2K 分享比例

在下载列表右键 ED2K 任务，选择 **ED2K 分享比例**：不限、不分享（完成后停止上传）、1:1、1.5:1、2:1、3:1、5:1。选择会写入 Motrix 用户数据目录下的 `ed2k-sharing.json`，应用每 10 秒读取 aria2-next 的 `uploadLength` 进行判断；达到比例后移除引擎任务，已下载文件保留。

这就是"下载多少、贡献多少"的每任务实现。eD2k 本身有 credits，但 aria2-next 没有暴露每任务 eD2k 比例选项，所以本分支在应用层强制执行。

速度说明：迅雷的十几二十 MB/s 来自中心缓存和 CDN，不是公开 eD2k 网络。开源 eD2k 的速度取决于实时在线源和对方上传带宽；本分支无法凭空制造不存在的源。

## 分享设置更新（最终版）

- 设置 → BitTorrent → **ED2K 分享** 中有 **为 ED2K 资源提供带宽** 开关，默认开启；关闭后所有 ED2K 任务下载完成即停止上传。
- 右键 ED2K 任务 → **ED2K 分享比例**，用滑轨在 0 到 10 之间选择：最左 0（完成即停传），最右为文件大小的 10 倍。预设：0.5（默认）、1、2、10、不限。
- 比例按任务独立生效：1 GB 文件选 0.5 表示目标上传 0.5 GB；选 2 是 2 GB；选 10 是 10 GB。
- 修复了误报的 **非 Motrix 版 aria2** 兼容性提示。aria2-next 现在被识别为本分支支持的 ED2K 引擎，不再把连接数限制到 16。
