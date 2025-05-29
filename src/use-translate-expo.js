import translate from "./translate.js"
import {useCallback} from "react"
import {useLocales} from "expo-localization"

const useTranslateExpo = () => {
  const locales = useLocales()
  let preferredLocales

  if (Array.isArray(locales)) {
    preferredLocales = locales?.map((localeData) => localeData.languageCode)
  }

  const currentTranslation = useCallback((msgId) => translate(msgId, preferredLocales), [preferredLocales])

  return currentTranslation
}

export default useTranslateExpo
