import { toFileUrl } from './../lib/deps.js'
import { strict as assert } from 'assert'
import * as Cache from './../lib/mod.js'
import { resolve } from 'path'

//console.log(Cache)

test('cache | local | relative', async () => {
  const url = './LICENSE'
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('local')
  await local.purge()
  assert.ok(!(await local.exists(url)))
  const file = await local.cache(url)
  assert.deepEqual(file.origin, Cache.Origin.FETCH)
  assert.ok(await local.exists(url))
  await local.remove(url)
  assert.ok(!(await local.exists(url)))
})
test('cache | local | abs/rel', async () => {
  const abs = resolve('./README.md')
  const rel = `./README.md`
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('local')
  await local.purge()
  assert.ok(!(await local.exists(abs)))
  assert.ok(!(await local.exists(rel)))
  const fileABS = await local.cache(abs)
  const fileREL = await local.cache(rel)

  assert.deepEqual(fileREL.meta.url, fileABS.meta.url)
  assert.deepEqual(fileABS.origin, Cache.Origin.FETCH)
  assert.deepEqual(fileREL.origin, Cache.Origin.CACHE)
  assert.ok(await local.exists(abs))
  assert.ok(await local.exists(rel))
  await local.remove(abs)
  assert.ok(!(await local.exists(rel)))
})

test('cache | local | file://', async () => {
  const url = toFileUrl(resolve('./CHANGELOG.md'))
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('local')
  await local.purge()
  assert.ok(!(await local.exists(url)))
  const file = await local.cache(url)
  assert.equal(file.origin, Cache.Origin.FETCH)
  assert.ok(await local.exists(url))
  await local.remove(url)
  assert.ok(!(await local.exists(url)))
})

test('cache | local | url', async () => {
  const url = new URL('README.md', import.meta.url)
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('local')
  await local.purge()
  assert.ok(!(await local.exists(url)))
  const file = await local.cache(url)
  assert.equal(file.origin, Cache.Origin.FETCH)
  assert.ok(await local.exists(url))
  await local.remove(url)
  assert.ok(!(await local.exists(url)))
})

test('cache | remote', async () => {
  const url = 'https://deno.land/std/version.ts'
  Cache.configure({
    directory: 'cache',
  })
  const remote = Cache.namespace('remote')
  await remote.purge()
  assert.ok(!(await remote.exists(url)))
  const file = await remote.cache(url)
  assert.deepEqual(file.origin, Cache.Origin.FETCH)
  assert.ok(await remote.exists(url))
  await remote.remove(url)
  assert.ok(!(await remote.exists(url)))
})

test('DENO_DIR | remote', async () => {
  const url = 'https://deno.land/std/version.ts'
  Cache.configure({
    directory: undefined,
  })
  const remote = Cache.namespace('remote')
  await remote.purge()
  assert.ok(!(await remote.exists(url)))
  const file = await remote.cache(url)
  assert.deepEqual(file.origin, Cache.Origin.FETCH)
  assert.ok(await remote.exists(url))
  await remote.remove(url)
  assert.ok(!(await remote.exists(url)))
})
