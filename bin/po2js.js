#!/usr/bin/env node

import Po2Js from "../src/po2js.js"

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

const po2Js = new Po2Js({directory})

await po2Js.run()
