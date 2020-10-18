import fs from "fs/promises";
import fetch from "node-fetch";
import {CacheError} from "./cache.js";
import {exists} from "./deps.js";
import {protocol, resolveFileURL} from "./helpers.js";
async function protocolFile(url, path) {
  const {pathname} = resolveFileURL(url);
  try {
    if (!await exists(pathname)) {
      throw new CacheError(`${pathname} does not exist on the local system.`);
    }
  } catch {
    throw new CacheError(`${pathname} is not valid.`);
  }
  await fs.copyFile(pathname, path);
  return {
    url: url.href
  };
}
async function protocolHttp(url, path) {
  const download = await fetch(url);
  if (!download.ok)
    throw new CacheError(download.statusText);
  const source = await download.arrayBuffer();
  await fs.writeFile(path, new Uint8Array(source));
  const headers = {};
  for (const [key, value] of download.headers) {
    headers[key] = value;
  }
  return {
    url: url.href,
    headers
  };
}
export async function ff(url, path) {
  switch (protocol(url.protocol)) {
    case "file":
      return await protocolFile(url, path);
    case "http":
    case "https":
      return await protocolHttp(url, path);
    default:
      throw new CacheError(`unsupported protocol ("${url}")`);
  }
}
