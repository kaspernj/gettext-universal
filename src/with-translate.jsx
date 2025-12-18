import config from "./config.js"
import events from "./events.js"
import {useCallback, useMemo, useState} from "react"
import TranslateContext from "./translate-context.js"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter.js"
import {useLocales} from "expo-localization"

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

  // @ts-expect-error
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

export default WithTranslate
