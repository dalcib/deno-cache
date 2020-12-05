import * as fs from 'fs/promises'
import fetch from 'node-fetch'
import type { Metadata } from './file.js'
import { CacheError } from './cache.js'
import { exists, join, resolve, fromFileUrl } from './deps.js'

async function protocolFile(url: URL, dest: string): Promise<Metadata> {
  const path = fromFileUrl(url)
  try {
    if (!(await exists(path))) {
      throw new CacheError(`${path} does not exist on the local system.`)
    }
  } catch {
    throw new CacheError(`${path} is not valid.`)
  }
  await fs.copyFile(path, dest) //await Deno.copyFile(path, dest)
  return {
    url: url.href,
  }
}

async function protocolHttp(url: URL, dest: string): Promise<Metadata> {
  const download = await fetch(url)
  if (!download.ok) {
    throw new CacheError(download.statusText)
  }
  const source = await download.arrayBuffer()
  //await Deno.writeFile(dest, new Uint8Array(source))
  await fs.writeFile(dest, new Uint8Array(source))

  const headers: { [key: string]: string } = {}
  for (const [key, value] of download.headers) {
    headers[key] = value
  }
  return {
    url: url.href,
    headers,
  }
}

export async function fetchFile(url: URL, dest: string): Promise<Metadata> {
  switch (url.protocol) {
    case 'file:':
      return await protocolFile(url, dest)

    case 'http:':
    case 'https:':
      return await protocolHttp(url, dest)

    default:
      throw new CacheError(`unsupported protocol ("${url}")`)
  }
}
