# Windows 版 ED2K 现成改法（逐处补丁）

这是 macOS 版实测后总结的完整修改点。Windows 端可直接照抄，不要再从零猜。

## 1. 所有协议白名单都要加 `ed2k`

Motrix 创建任务会经过多层准入，漏掉任何一层都会报"此下载不支持 URL 协议"。

| 文件 | 位置 | 改法 |
| --- | --- | --- |
| `src/shared/lib/download-source.ts` | `analyzeDownloadSource` 默认参数 | 列表末尾加 `'ed2k'` |
| `src/shared/schemas/download-source.ts` | `sourceProtocolSchema` | 枚举末尾加 `'ed2k'` |
| `src/core/task/source-admission.ts` | `admitDownloadSources` 默认参数 | 列表末尾加 `'ed2k'` |
| `src/core/task/source-admission.ts` | `admitTaskCreateRequest` 的 http 分支 | `['http','https','ftp','ed2k']` |
| `src/core/task/source-admission.ts` | 新增测试 `source-admission.test.ts` | 断言 ED2K 请求被接受 |
| `src/core/task/create-task-handler.ts` | 两处 `admitDownloadSources(..., 'plugin', ...)` | `['http','https','ed2k']` |
| `src/core/task/create-task-handler.ts` | 1 处 `admitDownloadSources(..., 'input', ...)` | `['http','https','ftp','ed2k']` |
| `src/core/task/actions/re-add-task.ts` | recovery 白名单 | `['http','https','ftp','ed2k']` |
| `src/core/session/session-manager.ts` | recovery 白名单 | `['http','https','ftp','ed2k']` |
| `src/core/plugin/hooks/hook-orchestrator.ts` | plugin 白名单 | `['http','https','ed2k']` |

## 2. 引擎替换

- 用 `aria2-next.exe` 替换内置 `aria2c.exe`。
- 包装脚本逻辑见 `ed2k-engine/aria2c-wrapper.sh`：
  - 过滤 `--enable-sqlite3-persistence`、`--sqlite3-db-path`、`--sqlite3-history-limit`；
  - `--version` 输出 `aria2 version 3.1.0-motrix-ed2k`；
  - 其他参数原样转发。

## 3. 打包后的应用也要改

如果改的是已打包应用（不是从源码构建），必须同步修改 `app.asar` 内编译后的 JS。macOS 版踩过的坑：

- 渲染进程分支要用 `dv(...)`，不能照抄主进程的 `Tt(...)`。
- 主进程默认白名单在压缩代码里是 `n=[`http`,`https`,`ftp`,`magnet`]`，不是源码写法 `t=[...]`。
- 主进程 `admitTaskCreateRequest` 压缩后是 `sn(n.uris,`input`,[...])`。
- 插件钩子压缩后是 `sn(a.uris,`plugin`,[...])`，共 3 处。
- 改完必须清空 Electron 缓存目录 `Code Cache` / `GPUCache` 再启动。

## 4. 验证清单（必须逐项通过）

1. `pnpm vitest run src/shared/lib/ed2k-link.test.ts src/shared/lib/download-source.test.ts src/core/task/source-admission.test.ts`
2. `pnpm exec tsc --noEmit`
3. `pnpm exec biome check`（改动文件）
4. 界面：新建任务粘贴 ED2K 链接，不再出现"此下载不支持 URL 协议"
5. RPC：`aria2.tellActive` 中能看到 `ed2k` 字段（hash/name/length），说明引擎真正接管
6. 用无版权文件测试；测试后通过 `aria2.remove` 清理任务
