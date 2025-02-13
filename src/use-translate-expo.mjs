import config from "./config.mjs"
import {useCallback} from "react"
import {useLocales} from "expo-localization"

const translate = (msgId, preferredLocales) => {
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

  if (!translation) translation = msgId

  return translation
}

const useTranslate = () => {
  const locales = useLocales()
  const preferredLocales = locales.map((localeData) => localeData.languageCode)
  const currentTranslation = useCallback((msgId) => translate(msgId, preferredLocales), [preferredLocales])

  return currentTranslation
}

export default useTranslate
