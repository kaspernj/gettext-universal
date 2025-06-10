class Config {
  constructor() {
    this.locales = {}
  }

  loadTranslationsFromRequireContext(requireContext) {
    for (const localeFile of requireContext.keys()) {
      const match = localeFile.match(/^\.\/([a-z]{2}).js$/)

      if (!match) {
        throw new Error(`Couldn't detect locale from file: ${localeFile}`)
      }

      const locale = match[1]
      const translations = requireContext(localeFile).default

      this.locales[locale] = translations
    }
  }

  getFallbacks = () => this.fallbacks
  getLocale = () => this.locale
  getLocales = () => this.locales

  setFallbacks(fallbacks) {
    this.fallbacks = fallbacks
  }

  setLocale(locale) {
    this.locale = locale
  }
}

const config = new Config()

export default config
