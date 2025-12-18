// @ts-check

import config from "./config.js"

/**
 * @typedef {object} TranslateArgs
 * @property {string} [defaultValue]
 * @property {string[]} [locales]
 */

/**
 * @param {string} msgId
 * @param {Record<string, any>} [variables]
 * @param {TranslateArgs | string[]} [argsCandidate] preferredLocales or arguments
 */
export default function translate(msgId, variables, argsCandidate) {
  let args
  let preferredLocales

  if (Array.isArray(argsCandidate)) {
    preferredLocales = argsCandidate
  } else if (typeof args == "object") {
    args = argsCandidate

    if (args.locales) {
      preferredLocales = args.locales
    }
  }

  if (!preferredLocales) {
    if (config.getLocale()) {
      preferredLocales = [config.getLocale()]
    } else {
      console.error("No 'preferredLocales' was given and a locale wasn't set in the configuration either")
    }
  }

  let translation

  if (preferredLocales) {
    for (const preferredLocale of preferredLocales) {
      const localeTranslations = config.getLocales()[preferredLocale]

      if (!localeTranslations) continue

      const localeTranslation = localeTranslations[msgId]

      if (localeTranslation) {
        translation = localeTranslation
        break
      }
    }
  }

  if (!translation) {
    const fallbacks = config.getFallbacks()

    if (fallbacks) {
      for (const fallback of config.getFallbacks()) {
        const localeTranslations = config.getLocales()[fallback]

        if (!localeTranslations) continue

        const localeTranslation = localeTranslations[msgId]

        if (localeTranslation) {
          translation = localeTranslation
          break
        }
      }
    }
  }

  if (!translation) {
    if (args?.defaultValue) {
      translation = args.defaultValue
    } else {
      translation = msgId
    }
  }

  if (variables) {
    for (const key in variables) {
      const value = variables[key]
      const replaceKey = `%{${key}}`

      translation = translation.replaceAll(replaceKey, value)
    }
  }

  return translation
}
