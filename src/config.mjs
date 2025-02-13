class Config {
  constructor() {
    this.locales = {}
  }

  loadTranslationsFromRequireContext(requireContext) {
    for (const localeFile of requireContext.keys()) {
      const match = localeFile.match(/^\.\/([a-z]{2}).mjs$/)

      if (!match) {
        throw new Error(`Couldn't detect locale from file: ${localeFile}`)
      }

      const locale = match[1]
      const translations = requireContext(localeFile).default

      locales[locale] = translations
    }
  }

  getFallbacks = () => this.fallbacks
  getLocales = () => this.locales

  setFallbacks(fallbacks) {
    this.fallbacks = fallbacks
  }
}

const config = new Config()

export default config
