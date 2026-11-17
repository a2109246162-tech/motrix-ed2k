import fs from 'node:fs'
import path from 'node:path'
import type { DownloadTask } from '@shared/types/task'

export type Ed2kShareRatio = -1 | 0 | 1 | 1.5 | 2 | 3 | 5

interface SharingEntry {
  taskId: string
  engineGid: string
  ratio: Ed2kShareRatio
}

export interface Ed2kSharingDeps {
  userDataDir: string
  adapter: {
    getUploadLength(engineTaskId: string): Promise<number>
    removeTask(engineTaskId: string): Promise<void>
  }
  taskManager: {
    getByEngineTaskId(engineTaskId: string): DownloadTask | undefined
  }
}

const VALID_RATIOS: readonly Ed2kShareRatio[] = [-1, 0, 1, 1.5, 2, 3, 5]
let monitorTimer: NodeJS.Timeout | undefined

function configPath(userDataDir: string) {
  return path.join(userDataDir, 'ed2k-sharing.json')
}

function readEntries(userDataDir: string): SharingEntry[] {
  try {
    const parsed: unknown = JSON.parse(
      fs.readFileSync(configPath(userDataDir), 'utf8')
    )
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is SharingEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as SharingEntry).taskId === 'string' &&
        typeof (entry as SharingEntry).engineGid === 'string' &&
        VALID_RATIOS.includes((entry as SharingEntry).ratio)
    )
  } catch {
    return []
  }
}

function writeEntries(userDataDir: string, entries: readonly SharingEntry[]) {
  fs.mkdirSync(userDataDir, { recursive: true })
  fs.writeFileSync(
    configPath(userDataDir),
    `${JSON.stringify(entries, null, 2)}\n`,
    'utf8'
  )
}

export function setEd2kShareRatio(
  deps: Ed2kSharingDeps,
  taskId: string,
  engineGid: string,
  ratio: Ed2kShareRatio
) {
  if (!VALID_RATIOS.includes(ratio)) throw new Error('Invalid ED2K share ratio')
  const entries = readEntries(deps.userDataDir).filter(
    (entry) => entry.taskId !== taskId
  )
  entries.push({ taskId, engineGid, ratio })
  writeEntries(deps.userDataDir, entries)
}

export function getEd2kShareRatio(
  userDataDir: string,
  taskId: string
): Ed2kShareRatio | undefined {
  return readEntries(userDataDir).find((entry) => entry.taskId === taskId)
    ?.ratio
}

export function startEd2kSharingMonitor(deps: Ed2kSharingDeps) {
  if (monitorTimer) return
  const tick = async () => {
    const entries = readEntries(deps.userDataDir)
    if (entries.length === 0) return
    const remaining: SharingEntry[] = []
    for (const entry of entries) {
      if (entry.ratio === -1) {
        remaining.push(entry)
        continue
      }
      const task = deps.taskManager.getByEngineTaskId(entry.engineGid)
      if (
        !task ||
        task.id !== entry.taskId ||
        !task.uris.some((uri) => uri.startsWith('ed2k://'))
      )
        continue
      if (entry.ratio === 0 && task.status !== 'completed') {
        remaining.push(entry)
        continue
      }
      try {
        const downloaded = Math.max(
          0,
          Number(task.downloadedBytes) || Number(task.totalBytes) || 0
        )
        const uploaded = await deps.adapter.getUploadLength(entry.engineGid)
        const reached =
          entry.ratio === 0 ||
          (downloaded > 0 && uploaded >= downloaded * entry.ratio)
        if (reached) {
          await deps.adapter.removeTask(entry.engineGid)
          continue
        }
      } catch {
        // Keep the entry for the next tick; a transient RPC failure must not
        // silently disable a user's sharing policy.
      }
      remaining.push(entry)
    }
    writeEntries(deps.userDataDir, remaining)
  }
  monitorTimer = setInterval(() => {
    void tick()
  }, 10_000)
  monitorTimer.unref?.()
}
