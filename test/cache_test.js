import { strict as assert } from 'assert'
import { Cache } from './../lib/mod.js'
import { resolve } from 'path'

test('cache | local | relative', async () => {
  const url = './LICENSE'
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('local')
  await local.purge()
  assert.ok(!(await local.exists(url)))
  const file = await local.fetch(url)
  assert.deepEqual(file.origin, Cache.Origin.FETCH)
  assert.ok(await local.exists(url))
  await local.remove(url)
  assert.ok(!(await local.exists(url)))
})
test('cache | local | abs/rel', async () => {
  const abs = `${resolve('./README.md')}`
  const rel = `./README.md`
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('local')
  await local.purge()
  assert.ok(!(await local.exists(abs)))
  assert.ok(!(await local.exists(rel)))
  const fileABS = await local.fetch(abs)
  const fileREL = await local.fetch(rel)

  assert.deepEqual(fileREL.meta.url, fileABS.meta.url)
  assert.deepEqual(fileABS.origin, Cache.Origin.FETCH)
  assert.deepEqual(fileREL.origin, Cache.Origin.CACHE)
  assert.ok(await local.exists(abs))
  assert.ok(await local.exists(rel))
  await local.remove(abs)
  assert.ok(!(await local.exists(rel)))
})
test('cache | remote', async () => {
  const url = 'https://deno.land/std/version.ts'
  Cache.configure({
    directory: 'cache',
  })
  const local = Cache.namespace('remote')
  await local.purge()
  assert.ok(!(await local.exists(url)))
  const file = await local.fetch(url)
  assert.deepEqual(file.origin, Cache.Origin.FETCH)
  assert.ok(await local.exists(url))
  await local.remove(url)
  assert.ok(!(await local.exists(url)))
  //assert.equal(2, 3);
  //throw error("sdfsdf");
  //console.log("dsafasdfasdfasdfasdf");
})

test('should ', () => {
  assert.equal(2, 2)
})
