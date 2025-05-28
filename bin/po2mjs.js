#!/usr/bin/env node

import Po2Mjs from "../src/po2mjs.js"

const processArgs = process.argv.slice(2)
let directory

for (let i = 0; i < processArgs.length; i++) {
  const arg = processArgs[i]

  if (arg == "--directory") {
    directory = processArgs[++i]
  } else {
    throw new Error(`Unknown argument: ${arg}`)
  }
}

const po2Mjs = new Po2Mjs({directory})

await po2Mjs.run()
