import translate from "./translate.js"
import TranslateContext from "./translate-context.js"
import {useCallback, useContext, useMemo} from "react"
import {useLocales} from "expo-localization"

/**
 * @typedef {(msgId: string, variables?: Record<string, any>, args?: import("./translate.js").TranslateArgs) => string} TranslateFunctionType
 */

/** @returns {TranslateFunctionType} */
export default function useTranslateExpo() {
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

  const currentTranslation = useCallback(/** @type {TranslateFunctionType} */ ((msgId, variables, args = {}) => {
    args.locales ||= preferredLocales

    return translate(msgId, variables, args)
  }), [preferredLocales])

  return currentTranslation
}
