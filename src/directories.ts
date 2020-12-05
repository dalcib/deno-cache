import { join, resolve } from './deps.js'
import { platform } from 'os'

const POSIX_HOME = 'HOME'

export function cachedir(): string {
  const env = (variable) => process.env[variable] //Deno.env.get
  const os = platform() //Deno.build.os

  const deno = env('DENO_DIR')

  if (deno) return resolve(deno)

  let home: string | undefined
  let path: string
  switch (os) {
    case 'linux': {
      const xdg = env('XDG_CACHE_HOME')
      home = xdg ?? env(POSIX_HOME)
      path = xdg ? 'deno' : join('.cache', 'deno')
      break
    }
    case 'darwin':
      home = env(POSIX_HOME)
      path = join('Library', 'Caches', 'deno')
      break

    case 'win32':
      home = env('LOCALAPPDATA')
      home = home ?? env('USERPROFILE')
      path = 'deno'
      break
  }

  path = home ? path : '.deno'
  if (!home) return path
  return resolve(join(home, path))
}

export function tmpdir(): string {
  const env = (variable) => process.env[variable] //Deno.env.get
  const os = platform() //Deno.build.os

  const tmp = env('TMPDIR') ?? env('TEMP') ?? env('TMP')
  if (tmp) return resolve(tmp)

  switch (os) {
    case 'linux':
    case 'darwin':
      return resolve('/tmp')
    case 'win32':
      return resolve(join(env('HOMEDRIVE') ?? env('SYSTEMDRIVE') ?? 'C:', 'TEMP'))
  }
}
