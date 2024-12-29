import {promises as fs} from "fs"
import path from "path"

export default class Scanner {
  constructor({directory, extensions, files, ignores, output, ...restArgs}) {
    if (Object.keys(restArgs).length > 0) throw new Error(`Unknown arrguments: ${Object.keys(restArgs).join(", ")}`)

    this.directory = directory
    this.extensions = extensions
    this.files = files
    this.ignores = ignores
    this.output = output
    this.scannedFiles = []
    this.translations = {}
  }

  async scan() {
    if (this.directory) {
      await this.scanDir(this.directory, [])
    } else if (this.files.length > 0) {
      await this.scanGivenFiles()
    } else {
      throw new Error("No directory or files given to scan")
    }

    await this.scanFiles()

    if (this.output) {
      await this.writeOutput()
    } else {
      console.log({translations: this.translations})
    }
  }

  async scanGivenFiles() {
    for (const file of this.files) {
      this.scannedFiles.push({
        fullPath: file,
        localPath: file,
      })
    }
  }

  async scanFiles() {
    const promises = []

    for (const fileData of this.scannedFiles) {
      promises.push(this.scanFile(fileData))
    }

    await Promise.all(promises)
  }

  async scanFile({localPath, fullPath}) {
    if (!fullPath) throw new Error(`Invalid fullPath given: ${fullPath}`)

    const contentBuffer = await fs.readFile(fullPath)
    const content = await contentBuffer.toString()
    const lines = content.split(/(\r\n|\n)/)

    for (let lineNumber = 1; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber - 1]
      const match = line.match(/_\(\s*("(.+?)"|'(.+?)')\s*(,|\))/)

      if (match) {
        const translationKey = match[2] || match[3]

        if (!translationKey) throw new Error("Empty translation key from match", {match})

        if (!(translationKey in this.translations)) {
          this.translations[translationKey] = {
            files: []
          }
        }

        this.translations[translationKey].files.push({localPath, lineNumber})
      }
    }
  }

  async scanDir(pathToScan, pathParts) {
    const files = await fs.readdir(pathToScan)
    const localPath = pathParts.join("/")

    if (this.ignores.includes(localPath)) {
      // console.log(`Ignoreing ${localPath}`)

      return
    }

    // console.log({files, path: pathParts.join("/")})

    for (const file of files) {
      const fullPath = `${pathToScan}/${file}`
      const stat = await fs.lstat(fullPath)

      if (stat.isDirectory()) {
        const newPathParts = pathParts.concat([file])

        this.scanDir(fullPath, newPathParts)
      } else {
        const ext = path.extname(file).toLowerCase()

        if (this.extensions.includes(ext)) {
          this.addScannedFile({fullPath, localPath: `${localPath}/${file}`})
        }
      }
    }
  }

  addScannedFile({fullPath, localPath}) {
    this.scannedFiles.push({
      fullPath,
      localPath,
    })
  }

  async writeOutput() {
    const fp = await fs.open(this.output, "w")

    let translationsCount = 0

    for (const translationKey in this.translations) {
      const translation = this.translations[translationKey]

      if (translationsCount >= 1) await fp.write("\n")

      for (const file of translation.files) {
        const {localPath, lineNumber} = file

        await fp.write(`#: ${localPath}:${lineNumber}\n`)
      }

      await fp.write(`msgid \"${translationKey}\"\n`)
      await fp.write("msgstr \"\"\n")

      translationsCount++
    }

    await fp.close()
  }
}
