import translate from "./translate.js"
import TranslateContext from "./translate-context.js"
import {useCallback, useContext, useMemo} from "react"
import {useLocales} from "expo-localization"

const useTranslateExpo = () => {
  const localeContext = useContext(TranslateContext)
  const locales = useLocales()

  const preferredLocales = useMemo(() => {
    let preferredLocales = []

    if (localeContext?.locale) {
      preferredLocales.push(localeContext.locale)
    }

    if (Array.isArray(locales)) {
      for (const localeData of locales) {
        preferredLocales.push(localeData.languageCode)
      }
    }

    return preferredLocales
  }, [localeContext?.locale, locales])

  const currentTranslation = useCallback((msgId, variables, args = {}) => {
    args.locales ||= preferredLocales

    return translate(msgId, variables, args)
  }, [preferredLocales])

  return currentTranslation
}

export default useTranslateExpo
