// @ts-check

import events from "./events.js"

class Config {
  constructor() {
    /** @type {Record<string, Record<string, any>>} */
    this.locales = {}
  }

  /** @param {{keys: () => string[], (key: string): {default: Record<string, any>}}} requireContext */
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

  /**
   * Returns the active locale. If `setLocale` was called with a
   * function (a resolver), the resolver is invoked here so callers
   * always receive a string — this lets apps plumb a per-request
   * locale through AsyncLocalStorage (or similar) transparently.
   *
   * @returns {string | undefined}
   */
  getLocale() {
    if (typeof this.locale === "function") return this.locale()
    return this.locale
  }

  getLocales() { return this.locales }

  /**
   * @param {string[]} fallbacks
   * @returns {void}
   */
  setFallbacks(fallbacks) {
    this.fallbacks = fallbacks
  }

  /**
   * Sets the active locale. Accepts a string (global/static locale)
   * OR a function that returns the current locale on each call
   * (useful for per-request locale backed by AsyncLocalStorage).
   *
   * @param {string | (() => string | undefined)} locale
   * @returns {void}
   */
  setLocale(locale) {
    this.locale = locale
    const resolvedLocale = typeof locale === "function" ? undefined : locale

    events.emit("onLocaleChange", {locale: resolvedLocale})
  }
}

const config = new Config()

export default config
