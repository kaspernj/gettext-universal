import {promises as fs} from "fs"
import path from "path"

export default class Po2Mjs {
  constructor({directory}) {
    this.directory = directory
  }

  async run() {
    const files = await fs.readdir(this.directory)

    for (const file of files) {
      const ext = path.extname(file).toLowerCase()

      if (ext == ".po") {
        await this.readFile(file, ext)
      }
    }
  }

  async readFile(file, ext) {
    const fullPath = `${this.directory}/${file}`
    const baseName = path.basename(file, ext)
    const jsFilePath = `${this.directory}/${baseName}.mjs`
    const fileContentBuffer = await fs.readFile(fullPath)
    const fileContent = fileContentBuffer.toString()
    const matches = fileContent.matchAll(/#: (.+?)\nmsgid \"(.+?)\"\nmsgstr \"(.+?)\"\n(\n|$)/g)
    const translations = {}

    for (const match of matches) {
      const msgId = match[2]
      const msgStr = match[3]

      translations[msgId] = msgStr
    }

    const jsCode = `export default ${JSON.stringify(translations, null, 2)}\n`

    await fs.writeFile(jsFilePath, jsCode)

    console.log(`Wrote ${jsFilePath}`)
  }
}
