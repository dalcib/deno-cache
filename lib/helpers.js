import {CacheError} from "./cache.js";
import {join, resolve} from "./deps.js";
export function protocol(protocol2) {
  return protocol2.slice(0, -1);
}
export function toURL(url) {
  if (typeof url === "string") {
    try {
      try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          url = new URL(url);
        } else {
          url = resolveFileURL(url);
        }
      } catch {
        url = resolveFileURL(url);
      }
    } catch (error) {
      throw new CacheError(error.message);
    }
  } else if (url.protocol === "file:") {
    url = resolveFileURL(url);
  }
  return url;
}
export function resolveFileURL(url) {
  let pathname;
  if (typeof url === "string") {
    pathname = resolve(url.replace("file://", ""));
  } else {
    pathname = resolve(join(url.host, url.pathname));
  }
  pathname = pathname.replace(/\\/g, "/");
  while (pathname[0] !== "/") {
    pathname = pathname.substr(pathname.indexOf("/"));
  }
  return new URL(encodeURI(`file://${pathname}`).replace(/[?#]/g, encodeURIComponent));
}
