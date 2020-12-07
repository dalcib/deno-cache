import * as fs from "fs/promises";
import {join, exists as _exists} from "./deps.js";
import {cachedir} from "./directories.js";
import {FileWrapper, Origin, RELOAD_POLICY} from "./file.js";
import {toURL} from "./helpers.js";
export {Origin, RELOAD_POLICY};
export class Wrapper {
  #namespace;
  constructor(ns) {
    this.#namespace = ns;
  }
  async cache(url, policy) {
    return await cache(url, policy, this.#namespace);
  }
  async remove(url) {
    return await remove(url, this.#namespace);
  }
  async exists(url) {
    return await exists(url, this.#namespace);
  }
  async purge() {
    return await purge(this.#namespace);
  }
}
export class CacheError extends Error {
  constructor(message) {
    super(message);
    this.name = "CacheError";
  }
}
export function namespace(ns) {
  return new Wrapper(ns);
}
export function global() {
  return new Wrapper();
}
export function configure(opts) {
  options = opts;
}
export function directory() {
  return options.directory ?? cachedir();
}
export async function cache(url, policy, ns) {
  const wrapper = new FileWrapper(toURL(url), policy, ns);
  return await wrapper.get();
}
export async function exists(url, ns) {
  const wrapper = new FileWrapper(toURL(url), void 0, ns);
  return await wrapper.exists();
}
export async function remove(url, ns) {
  const wrapper = new FileWrapper(toURL(url), void 0, ns);
  if (!await wrapper.exists())
    return false;
  await wrapper.remove();
  return true;
}
export async function purge(ns) {
  const dir = [directory()];
  if (ns)
    dir.push(ns);
  const path = join(...dir);
  if (!await _exists(path))
    return false;
  await fs.rmdir(path, {recursive: true});
  return true;
}
export let options = {
  directory: void 0
};
export const Cache = Wrapper;
