# deno-cache

This npm package is a port of the [cache](https://deno.land/x/cache) module of Deno to be used with nodejs.



Cache library, compatible with deno [module caching](https://deno.land/manual/linking_to_external_code).

```typescript
import {readFile} from 'fs/promises'
import  {cache} from "deno-cache";

let file = await cache("https://example.com/file.json");

const text = await fs.readFile(file.path, 'utf8');
console.log(text);
```

or


```typescript
import {readFile} from 'fs/promises'
import  * as Cache from "deno-cache";

const url = 'https://example.com/file.js'

Cache.configure({
  directory: 'cache',
})
const deps = Cache.namespace('deps')

console.log(await deps.exists(url)) //false

const file = await deps.cache(url)

console.log(await deps.exists(url)) //true

console.log(file)
/* {
  url: URL {...}
  policy: undefined,
  ns: 'deps',
  hash: 'cdb5afb638e1edad8d0b947130a614930b0ec51ada5294dcedf120ad1518692f',
  path: './cache/deps/https/example.com/cdb5afb638e1edad8d0b947130a614930b0ec51ada5294dcedf120ad1518692f',       
  metapath: './cache/deps/https/example.com/cdb5afb638e1edad8d0b947130a614930b0ec51ada5294dcedf120ad1518692f.metadata.json',
  origin: 'fetch'
  lstat: Stats {...}
}*/

await deps.remove(abs)
console.log(await deps.exists(url)) //false
```
  
