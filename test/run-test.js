import fs from 'fs'
import { types } from 'util'
import { resolve } from 'path'

const regex = /__tests__|(\.|_)(test|spec).(j)sx?$/m
const arg = process.argv.slice(2)[0]
const dir = resolve(process.cwd(), arg ? arg : '')
console.log(dir)
let files = fs.readdirSync(dir).filter((file) => regex.test(file))
let tests = []

global.test = function test(name, fn) {
  tests.push({ name, fn })
}

function run() {
  tests.forEach((t) => {
    if (types.isAsyncFunction(t.fn)) {
      t.fn()
        .then(() => console.log('✅', t.name))
        .catch((e) => {
          console.log('❌', t.name)
          console.log(e.stack)
        })
    } else {
      try {
        t.fn()
        console.log('✅', t.name)
      } catch (e) {
        console.log('❌', t.name)
        console.log(e.stack)
      }
    }
  })
}

await Promise.all(files.map((file) => import('file://' + dir + '/' + file))).catch((e) =>
  console.log(e)
)

run()
