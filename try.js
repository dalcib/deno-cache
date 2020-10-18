import { Cache } from './lib/mod.js'
import fs from 'fs/promises'
let file = await Cache.fetch('./README.md')
const text = await fs.readFile(file.path, 'utf8')
console.log(text)
