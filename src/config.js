// @ts-check

import events from "./events.js"

class Config {
  constructor() {
    /** @type {Record<string, Record<string, any>>} */
    this.locales = {}
  }

  loadTranslationsFromRequireContext(requireContext) {
    for (const localeFile of requireContext.keys()) {
      const match = localeFile.match(/([a-z]{2}).js$/)

      if (!match) {
        throw new Error(`Couldn't detect locale from file: ${localeFile}`)
      }

      const locale = match[1]
      const translations = requireContext(localeFile).default

      this.locales[locale] = translations
    }
  }

  getFallbacks() { return this.fallbacks }
  getLocale() { return this.locale }
  getLocales() { return this.locales }

  /**
   * @param {string[]} fallbacks
   * @returns {void}
   */
  setFallbacks(fallbacks) {
    this.fallbacks = fallbacks
  }

  /**
   * @param {string} locale
   * @returns {void}
   */
  setLocale(locale) {
    this.locale = locale
    events.emit("onLocaleChange", {locale})
  }
}

const config = new Config()

export default config
