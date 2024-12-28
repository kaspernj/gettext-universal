#!/usr/bin/env node

import Scanner from "../src/scanner.mjs"

const processArgs = process.argv.slice(2)
const extensions = []
const files = []
const ignores = []
let directory, output

for (let i = 0; i < processArgs.length; i++) {
  const arg = processArgs[i]

  if (arg == "--directory") {
    directory = processArgs[++i]
  } else if (arg == "--extension") {
    extensions.push(processArgs[++i])
  } else if (arg == "--files") {
    while (i < processArgs.length - 1) {
      const file = processArgs[++i]

      if (!file) throw new Error("No file found?")

      files.push(file)
    }
  } else if (arg == "--ignore") {
    ignores.push(processArgs[++i])
  } else if (arg == "--output") {
    output = processArgs[++i]
  } else {
    throw new Error(`Unknown argument: ${arg}`)
  }
}

if (extensions.length == 0) {
  extensions.push(".js", ".cjs", ".mjs", ".jsx", ".tsx")
}

const scanner = new Scanner({directory, extensions, files, ignores, output})

await scanner.scan()
