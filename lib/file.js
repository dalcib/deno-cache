import * as fs from "fs/promises";
import {createHash, dirname, ensureDir, exists, join, resolve} from "./deps.js";
import {fetchFile} from "./file_fetcher.js";
import {directory} from "./cache.js";
export const RELOAD_POLICY = {
  maxAge: -1
};
function checkPolicy(file, policy) {
  if (!file.lstat.birthtime && !policy.strict)
    return true;
  if (!file.lstat.birthtime)
    return false;
  if (policy.maxAge < 0)
    return false;
  const now = new Date();
  const then = file.lstat.birthtime;
  const delta = (now.getTime() - then.getTime()) / 1e3;
  const stale = delta > policy.maxAge;
  return stale;
}
export var Origin;
(function(Origin2) {
  Origin2["CACHE"] = "cache";
  Origin2["FETCH"] = "fetch";
})(Origin || (Origin = {}));
export class FileWrapper {
  constructor(url, policy, ns) {
    this.url = url;
    this.policy = policy;
    this.ns = ns;
    this.hash = hash(url);
    this.path = path(url, ns);
    this.metapath = metapath(url, ns);
  }
  async exists() {
    return await exists(this.path);
  }
  async remove() {
    await fs.unlink(this.path);
    await fs.unlink(this.metapath);
  }
  async ensure() {
    return await ensureDir(dirname(this.path));
  }
  async read() {
    const meta = await metaread(this.url, this.ns);
    return {
      ...this,
      lstat: await fs.lstat(this.path),
      meta,
      origin: Origin.CACHE
    };
  }
  async fetch() {
    const meta = await fetchFile(this.url, this.path);
    await metasave(meta, this.url, this.ns);
    return {
      ...this,
      lstat: await fs.lstat(this.path),
      meta,
      origin: Origin.FETCH
    };
  }
  async get() {
    await this.ensure();
    if (await this.exists()) {
      const file = await this.read();
      if (!this.policy)
        return file;
      if (checkPolicy(file, this.policy))
        return file;
    }
    return await this.fetch();
  }
}
function hash(url) {
  const formatted = `${url.pathname}${url.search ? "?" + url.search : ""}`;
  return createHash("sha256").update(formatted).digest().toString("hex");
}
function path(url, ns) {
  let path2 = [directory()];
  if (ns)
    path2.push(ns);
  path2 = path2.concat([url.protocol.slice(0, -1), url.hostname, hash(url)]);
  return resolve(`${join(...path2)}`);
}
function metapath(url, ns) {
  return resolve(`${path(url, ns)}.metadata.json`);
}
async function metasave(meta, url, ns) {
  await fs.writeFile(metapath(url, ns), JSON.stringify(meta));
}
async function metaread(url, ns) {
  const metadata = await fs.readFile(metapath(url, ns), "utf8");
  return JSON.parse(metadata);
}
