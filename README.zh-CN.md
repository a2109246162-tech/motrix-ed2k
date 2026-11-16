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
