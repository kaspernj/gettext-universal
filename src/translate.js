import config from "./config.js"

const translate = (msgId, variables, args) => {
  let preferredLocales

  if (Array.isArray(args)) {
    preferredLocales = args
    args = null
  } else if (args?.locales) {
    preferredLocales = args.locales
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

export default translate
