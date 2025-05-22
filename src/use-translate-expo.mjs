import translate from "./translate.mjs"
import {useCallback} from "react"
import {useLocales} from "expo-localization"

const useTranslate = () => {
  const locales = useLocales()
  const preferredLocales = locales.map((localeData) => localeData.languageCode)
  const currentTranslation = useCallback((msgId) => translate(msgId, preferredLocales), [preferredLocales])

  return currentTranslation
}

export default useTranslate
