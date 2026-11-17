import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  type Ed2kSharingDeps,
  getEd2kShareRatio,
  setEd2kShareRatio,
} from './ed2k-sharing'

const dirs: string[] = []

function makeDeps(): Ed2kSharingDeps & {
  adapter: {
    getUploadLength: ReturnType<typeof vi.fn>
    removeTask: ReturnType<typeof vi.fn>
  }
} {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ed2k-share-'))
  dirs.push(userDataDir)
  return {
    userDataDir,
    adapter: {
      getUploadLength: vi.fn().mockResolvedValue(0),
      removeTask: vi.fn().mockResolvedValue(undefined),
    },
    taskManager: { getAll: () => [], getByEngineTaskId: () => undefined },
    settings: { get: () => ({ engine: { ed2kShareBandwidth: true } }) },
  }
}

afterEach(() => {
  for (const dir of dirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true })
})

describe('ED2K sharing ratio store', () => {
  it('stores and reads a per-task ratio', () => {
    const deps = makeDeps()
    setEd2kShareRatio(deps, 'task-1', 'gid-1', 1.5)
    expect(getEd2kShareRatio(deps.userDataDir, 'task-1')).toBe(1.5)
  })

  it('rejects unsupported ratios', () => {
    const deps = makeDeps()
    expect(() => setEd2kShareRatio(deps, 'task-1', 'gid-1', 11)).toThrow(
      'Invalid ED2K share ratio'
    )
  })
})
