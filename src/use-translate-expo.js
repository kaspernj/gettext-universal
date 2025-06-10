import {digg} from "diggerize"
import EventEmitter from "events"
import translate from "./translate.js"
import {createContext, useCallback, useContext, useMemo, useState} from "react"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"
import {useLocales} from "expo-localization"

const eventEmitter = new EventEmitter()
const TranslateContext = createContext()

const shared = {
  locale: null
}

const setLocale = (locale) => {
  shared.locale = locale
  eventEmitter.emit("changeLocale", {locale})
}

const WithTranslate = ({children, ...restProps}) => {
  const locales = useLocales()
  const [locale, setLocale] = useState(digg(shared, "locale"))

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

  useEventEmitter(eventEmitter, "changeLocale", onChangeLocale)

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

  const currentTranslation = useCallback((msgId, args = {}) => {
    args.locales = preferredLocales

    return translate(msgId, args)
  }, [preferredLocales])

  return currentTranslation
}

export {setLocale, WithTranslate}
export default useTranslateExpo
