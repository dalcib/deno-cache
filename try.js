import { cache } from './lib/mod.js'
import fs from 'fs/promises'
let file = await cache('./README.md')
const text = await fs.readFile(file.path, 'utf8')
console.log(text)
