/// <reference types="node" />
declare module 'deps' {
  export { resolve, join, extname, dirname } from 'path'
  export { createHash } from 'crypto'
  import { pathToFileURL } from 'url'
  export function ensureDir(dir: string): Promise<void>
  export function exists(filePath: string): Promise<boolean>
  export const toFileUrl: typeof pathToFileURL
  export function fromFileUrl(url: string | URL): string
}
declare module 'directories' {
  export function cachedir(): string
  export function tmpdir(): string
}
declare module 'file_fetcher' {
  import type { Metadata } from 'file'
  export function fetchFile(url: URL, dest: string): Promise<Metadata>
}
declare module 'file' {
  import { StatsBase } from 'fs'
  export interface Policy {
    maxAge: number
    strict?: boolean
  }
  export const RELOAD_POLICY: Policy
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
    lstat: StatsBase<number>
    origin: Origin
    policy?: Policy
    ns?: string
  }
  export type File = Readonly<IFile>
  export interface Metadata {
    headers?: {
      [key: string]: string
    }
    url: string
  }
  export class FileWrapper {
    url: URL
    policy?: Policy
    ns?: string
    hash: string
    path: string
    metapath: string
    constructor(url: URL, policy?: Policy, ns?: string)
    exists(): Promise<boolean>
    remove(): Promise<void>
    ensure(): Promise<void>
    read(): Promise<File>
    fetch(): Promise<File>
    get(): Promise<File>
  }
}
declare module 'helpers' {
  export function toURL(url: string | URL): URL
  export function resolveFileURL(url: URL | string): URL
}
declare module 'cache' {
  import { File, Origin, Policy, RELOAD_POLICY } from 'file'
  export type { File, Policy }
  export { Origin, RELOAD_POLICY }
  interface Options {
    directory: string | undefined
  }
  export class Wrapper {
    #private
    constructor(ns?: string)
    cache(url: string | URL, policy?: Policy): Promise<File>
    remove(url: string | URL): Promise<boolean>
    exists(url: string | URL): Promise<boolean>
    purge(): Promise<boolean>
  }
  export class CacheError extends Error {
    constructor(message: string)
  }
  export function namespace(ns: string): Wrapper
  export function global(): Wrapper
  export function configure(opts: Options): void
  export function directory(): string
  export function cache(url: string | URL, policy?: Policy, ns?: string): Promise<File>
  export function exists(url: string | URL, ns?: string): Promise<boolean>
  export function remove(url: string | URL, ns?: string): Promise<boolean>
  export function purge(ns?: string): Promise<boolean>
  export let options: Options
  export const Cache: typeof Wrapper
}
declare module 'mod' {
  export * from 'cache'
}

declare module 'deno-cache' {
  export * from 'mod'
}
