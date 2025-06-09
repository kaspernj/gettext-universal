import config from "./config.js"

const translate = (msgId, args) => {
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

      return msgId
    }
  }

  let translation

  for (preferredLocale of preferredLocales) {
    const localeTranslations = config.getLocales()[preferredLocale]

    if (!localeTranslations) continue

    const localeTranslation = localeTranslations[msgId]

    if (localeTranslation) {
      translation = localeTranslation
      break
    }
  }

  if (!translation) {
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

  if (!translation) {
    if (args?.defaultValue) {
      translation = args.defaultValue
    } else {
      translation = msgId
    }
  }

  return translation
}

export default translate
