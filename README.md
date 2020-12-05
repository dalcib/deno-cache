# deno-cache

This npm package is a port of the [cache](https://deno.land/x/cache) module of Deno to be used with nodejs.



Cache library, compatible with deno [module caching](https://deno.land/manual/linking_to_external_code).

```typescript
import {readFile} from 'fs/promises'
import  {cache} from "https://deno.land/x/cache/mod.ts";

let file = await cache("https://example.com/file.json");

const text = await fs.readFile(file.path, 'utf8');
console.log(text);
```

  
