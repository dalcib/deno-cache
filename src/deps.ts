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
import * as fs from 'fs/promises'
import { StatsBase, PathLike } from 'fs'
import { pathToFileURL } from 'url'
import { platform } from 'os'

type PathType = 'file' | 'dir' | 'symlink'

function getFileInfoType(fileInfo: StatsBase<number>): PathType | undefined {
  return fileInfo.isFile()
    ? 'file'
    : fileInfo.isDirectory()
    ? 'dir'
    : fileInfo.isSymbolicLink()
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

/* export async function exists(filePath: string): Promise<boolean> {
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
} */

export async function exists(p: PathLike) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

export const toFileUrl = pathToFileURL

export function fromFileUrl(url: string | URL): string {
  const isWindows = platform() === 'win32'
  url = url instanceof URL ? url : new URL(url)
  if (url.protocol != 'file:') {
    throw new TypeError('Must be a file URL.')
  }
  if (isWindows) {
    let path = decodeURIComponent(
      url.pathname.replace(/\//g, '\\').replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
    ).replace(/^\\*([A-Za-z]:)(\\|$)/, '$1\\')
    if (url.hostname != '') {
      path = `\\\\${url.hostname}${path}`
    }
    return path
  } else {
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, '%25'))
  }
}
