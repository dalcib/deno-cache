import * as fs from "fs/promises";
import fetch from "node-fetch";
import {CacheError} from "./cache.js";
import {exists, fromFileUrl} from "./deps.js";
async function protocolFile(url, dest) {
  const path = fromFileUrl(url);
  try {
    if (!await exists(path)) {
      throw new CacheError(`${path} does not exist on the local system.`);
    }
  } catch {
    throw new CacheError(`${path} is not valid.`);
  }
  await fs.copyFile(path, dest);
  return {
    url: url.href
  };
}
async function protocolHttp(url, dest) {
  const download = await fetch(url);
  if (!download.ok) {
    throw new CacheError(download.statusText);
  }
  const source = await download.arrayBuffer();
  await fs.writeFile(dest, new Uint8Array(source));
  console.log(`Download ${url}`);
  const headers = {};
  for (const [key, value] of download.headers) {
    headers[key] = value;
  }
  return {
    url: url.href,
    headers
  };
}
export async function fetchFile(url, dest) {
  switch (url.protocol) {
    case "file:":
      return await protocolFile(url, dest);
    case "http:":
    case "https:":
      return await protocolHttp(url, dest);
    default:
      throw new CacheError(`unsupported protocol ("${url}")`);
  }
}
