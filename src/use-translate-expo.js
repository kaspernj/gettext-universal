import config from "./config.js"
import events from "./events.js"
import translate from "./translate.js"
import {createContext, useCallback, useContext, useMemo, useState} from "react"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"
import {useLocales} from "expo-localization"

const TranslateContext = createContext()

const WithTranslate = ({children, ...restProps}) => {
  const locales = useLocales()
  const [locale, setLocale] = useState(config.getLocale())

  const actualLocales = useMemo(() => {
    const actualLocales = []

    if (locale) {
      actualLocales.push(locale)
    }

    for (const locale of locales) {
      actualLocales.push(locale.languageCode)
    }

    return actualLocales
  }, [locale, locales])

  const contextData = useMemo(() => ({locale, locales: actualLocales}), [actualLocales])

  const onChangeLocale = useCallback(({locale}) => {
    setLocale(locale)
  }, [])

  useEventEmitter(events, "onLocaleChange", onChangeLocale)

  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Unknown props given: ${restPropsKeys.join(", ")}`)
  }

  return (
    <TranslateContext.Provider value={contextData}>
      {children}
    </TranslateContext.Provider>
  )
}

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

export {WithTranslate}
export default useTranslateExpo
