import * as fs from 'fs/promises'
import { Stats } from 'fs'
import { createHash, dirname, ensureDir, exists, join, resolve, extname } from './deps.js'
import { fetchFile } from './file_fetcher.js'
import { directory } from './cache.js'

export interface Policy {
  maxAge: number
  strict?: boolean
}

export const RELOAD_POLICY: Policy = {
  maxAge: -1,
}

function checkPolicy(file: File, policy: Policy): boolean {
  // birthtime is not available on all platforms.
  if (!file.lstat.birthtime && !policy.strict) return true
  if (!file.lstat.birthtime) return false
  if (policy.maxAge < 0) return false

  const now = new Date()
  const then = file.lstat.birthtime
  const delta = (now.getTime() - then.getTime()) / 1000
  const stale = delta > policy.maxAge
  return stale
}

export enum Origin {
  CACHE = 'cache',
  FETCH = 'fetch',
}

interface IFile {
  url: URL
  hash: string
  path: string
  metapath: string
  meta: Metadata
  lstat: Stats //Deno.FileInfo
  origin: Origin

  policy?: Policy
  ns?: string
}

export type File = Readonly<IFile>

export interface Metadata {
  headers?: { [key: string]: string }
  url: string
}

export class FileWrapper {
  hash: string
  path: string
  metapath: string

  constructor(public url: URL, public policy?: Policy, public ns?: string) {
    this.hash = hash(url)
    this.path = path(url, ns)
    this.metapath = metapath(url, ns)
  }

  async exists(): Promise<boolean> {
    return await exists(this.path)
  }

  async remove(): Promise<void> {
    //await Deno.remove(this.path)
    //await Deno.remove(this.metapath)
    await fs.unlink(this.path)
    await fs.unlink(this.metapath)
  }

  async ensure(): Promise<void> {
    return await ensureDir(dirname(this.path))
  }

  async read(): Promise<File> {
    const meta = await metaread(this.url, this.ns)
    return {
      ...this,
      lstat: await fs.lstat(this.path), //await Deno.lstat(this.path),
      meta,
      origin: Origin.CACHE,
    }
  }

  async fetch(): Promise<File> {
    const meta = await fetchFile(this.url, this.path)
    await metasave(meta, this.url, this.ns)
    return {
      ...this,
      lstat: await fs.lstat(this.path), //await Deno.lstat(this.path),
      meta,
      origin: Origin.FETCH,
    }
  }

  async get(): Promise<File> {
    await this.ensure()
    if (await this.exists()) {
      const file = await this.read()
      if (!this.policy) return file
      if (checkPolicy(file, this.policy)) return file
    }
    return await this.fetch()
  }
}

function hash(url: URL) {
  const formatted = `${url.pathname}${url.search ? '?' + url.search : ''}`
  return createHash('sha256').update(formatted).digest().toString('hex')
}

function path(url: URL, ns?: string) {
  let path = [directory()]
  if (ns) path.push(ns)
  path = path.concat([url.protocol.slice(0, -1), url.hostname, hash(url)])
  return resolve(`${join(...path)}`) //${extname(url.pathname)}`)
}

function metapath(url: URL, ns?: string) {
  return resolve(`${path(url, ns)}.metadata.json`)
}

async function metasave(meta: Metadata, url: URL, ns?: string): Promise<void> {
  //await Deno.writeTextFile(metapath(url, ns), JSON.stringify(meta))
  await fs.writeFile(metapath(url, ns), JSON.stringify(meta))
}

async function metaread(url: URL, ns?: string): Promise<Metadata> {
  //const metadata = await Deno.readTextFile(metapath(url, ns))
  const metadata = await fs.readFile(metapath(url, ns), 'utf8')
  return JSON.parse(metadata) //as Metadata
}
