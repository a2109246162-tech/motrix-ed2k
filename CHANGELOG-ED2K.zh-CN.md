# ED2K 版 — 变更清单（简体中文）

[English](./CHANGELOG-ED2K.md)

基线：上游 Motrix v2.4.2（`c601dcf`），叠加 `motrix-macos12` 的 macOS 12 兼容补丁。

## 改动内容

| 区域 | 文件 | 具体改动 |
| --- | --- | --- |
| ED2K 解析 | `src/shared/lib/ed2k-link.ts`（新增） | 严格解析 eD2k file/server/serverlist 链接，给出精确诊断。 |
| 解析测试 | `src/shared/lib/ed2k-link.test.ts`（新增） | 17 个测试，覆盖合法格式与错误输入。 |
| 源分析 | `src/shared/lib/download-source.ts`、`src/shared/schemas/download-source.ts` | 加入 `ed2k` 协议与诊断；`analyzeDownloadSource` 增加 ED2K 分支。 |
| 准入 | `src/core/task/source-admission.ts`（及 `.test.ts`） | 默认白名单和 `admitTaskCreateRequest` 加入 `ed2k`；新增测试断言 ED2K 请求被接受。 |
| 任务创建 | `src/core/task/create-task-handler.ts` | input 白名单和两处 plugin 钩子白名单加入 `ed2k`。 |
| 恢复 | `src/core/task/actions/re-add-task.ts`、`src/core/session/session-manager.ts` | recovery 白名单加入 `ed2k`。 |
| 插件钩子 | `src/core/plugin/hooks/hook-orchestrator.ts` | plugin 白名单加入 `ed2k`。 |
| 引擎 | `ed2k-engine/aria2c-wrapper.sh`、`ed2k-engine/install-engine.sh` | 用 aria2-next 3.1.0 替换 aria2；过滤 SQLite 参数；规范化 `--version`；加载 `server.met` / `nodes.dat`；加入活跃服务器；开启 16 分块与 200 ED2K 连接。 |
| 网络引导 | `ed2k-engine/server.met`、`nodes.dat`、`servers.json` | 来自 upd.emule-security.org 与 Telemacore 的 eD2k 服务器/Kad 列表。 |
| 安装包 | DMG 内的 `app.asar` | 把同样的 ED2K 逻辑注入编译后的主进程/渲染进程；处理压缩代码差异（`dv` 与 `Tt`、`n=[...]` 与 `t=[...]`、`ba([...])` 枚举）。 |
| 文档 | README 中英版、本变更清单中英版、Windows 改法/提示词中英版、`ATTRIBUTION.md`、`THIRD_PARTY_NOTICES.md` | 只描述已验证行为和限制。 |

## 验证

- 64 个 ED2K 相关测试通过；`tsc --noEmit` 与 Biome 通过。
- macOS 12.7.6：应用和引擎正常启动；RPC 观测 `serverCount=28`、`connectedServerCount=1`、`kadNodeCount≈75`。
- 用户提供的 Office ISO 链接只作为格式测试样例；干跑结果 `CN:0`（无在线源），未下载该文件。

## 已知限制

- 实际传输速度完全取决于该 hash 当前是否有在线源。`CN:0` 时任何客户端都会是 0 B/s。
- 随包 `aria2-next` 为 GPL-2.0；MIT 仅适用于 Motrix 源码及本分支补丁。
- macOS 12 上登录项注册不可用（继承自基础兼容补丁）。

## 冷门资源诊断

- 新增 `ed2k-engine/source-lookup.py`，查询历史 eD2k 可用源并输出对应 `ip:port` 服务器。
- 把之前 hash 对应的 `eMule Sunrise`、`Astra-3`、`MO-ad-free` 加入包装脚本。
- 因 UPnP 返回 501，包装脚本关闭 UPnP；文档说明需在路由器手动转发端口。

## 每任务分享

- 新增 `src/core/task/ed2k-sharing.ts`：每任务比例存储，以及每 10 秒读取 aria2-next `uploadLength` 的监控器。
- 新增 `command:setEd2kShareRatio` IPC 命令，并在 ED2K 任务右键菜单加入 **ED2K 分享比例** 子菜单。
- 可选：不限、0（完成后停止上传）、1、1.5、2、3、5。达到目标后移除引擎任务，文件保留。
