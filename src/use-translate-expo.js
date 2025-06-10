import EventEmitter from "events"
import translate from "./translate.js"
import {createContext, useCallback, useMemo, useState} from "react"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"
import {useLocales} from "expo-localization"

const eventEmitter = new EventEmitter()
const TranslateContext = createContext()

const setLocale = (locale) => {
  eventEmitter.emit("changeLocale", {locale})
}

const WithTranslate = ({children, ...restProps}) => {
  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Unknown props given: ${restPropsKeys.join(", ")}`)
  }

  const locales = useLocales()
  const [locale, setLocale] = useState()
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

  const contextData = useMemo(() => ({locales: actualLocales}), [actualLocales])

  const onChangeLocale = useCallback(({locale}) => {
    setLocale(locale)
  }, [])

  useEventEmitter(eventEmitter, "changeLocale", onChangeLocale)

  return (
    <TranslateContext.Provider value={contextData}>
      {children}
    </TranslateContext.Provider>
  )
}

const useTranslateExpo = () => {
  const locales = useLocales()
  let preferredLocales

  if (Array.isArray(locales)) {
    preferredLocales = locales?.map((localeData) => localeData.languageCode)
  }

  const currentTranslation = useCallback((msgId, args = {}) => {
    args.locales = preferredLocales

    return translate(msgId, args)
  }, [preferredLocales])

  return currentTranslation
}

export {setLocale, WithTranslate}
export default useTranslateExpo
