import { join, resolve, toFileUrl, fromFileUrl } from './deps.js'

export function toURL(url: string | URL): URL {
  if (typeof url === 'string') {
    if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('file:')) {
      url = new URL(url)
    } else {
      url = toFileUrl(resolve(url))
    }
  } else if (url.protocol === 'file:') {
    url = toFileUrl(resolve(fromFileUrl(url)))
  }

  return url
}

export function resolveFileURL(url: URL | string): URL {
  let pathname

  if (typeof url === 'string') {
    pathname = resolve(url.replace('file://', ''))
  } else {
    pathname = resolve(join(url.host, url.pathname))
  }

  pathname = pathname.replace(/\\/g, '/') // windows, grr

  while (pathname[0] !== '/') {
    pathname = pathname.substr(pathname.indexOf('/'))
  }

  return new URL(encodeURI(`file://${pathname}`).replace(/[?#]/g, encodeURIComponent))
}
