/* export {
  resolve,
  join,
  extname,
  dirname,
  fromFileUrl,
} from 'https://deno.land/std@0.71.0/path/mod.ts'

export { exists, existsSync, ensureDir } from 'https://deno.land/std@0.71.0/fs/mod.ts'

export { createHash } from 'https://deno.land/std@0.71.0/hash/mod.ts' */

export { resolve, join, extname, dirname } from 'path'
export { createHash } from 'crypto'
import fs from 'fs/promises'
import { StatsBase } from 'fs'

type PathType = 'file' | 'dir' | 'symlink'

function getFileInfoType(fileInfo: StatsBase<number>): PathType | undefined {
  return fileInfo.isFile
    ? 'file'
    : fileInfo.isDirectory
    ? 'dir'
    : fileInfo.isSymbolicLink
    ? 'symlink'
    : undefined
}

export async function ensureDir(dir: string): Promise<void> {
  try {
    const fileInfo = await fs.lstat(dir)
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`)
    }
  } catch (err) {
    //if (err instanceof Deno.errors.NotFound) {
    if (err.code === 'ENOENT') {
      // if dir not exists. then create it.
      await fs.mkdir(dir, { recursive: true })
      return
    }
    throw err
  }
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.lstat(filePath)
    return true
  } catch (err) {
    //if (err instanceof Deno.errors.NotFound) {
    if (err.code === 'ENOENT') {
      return false
    }
    throw err
  }
}
