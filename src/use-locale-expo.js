// @ts-check

import {useContext, useEffect, useMemo, useRef, useState} from "react"
import {useLocales} from "expo-localization"
import config from "./config.js"
import events from "./events.js"
import TranslateContext from "./translate-context.js"

/**
 * Subscribes the calling component to the current locale so it re-renders
 * when any code calls `config.setLocale(...)` (e.g. a settings picker).
 * Also syncs the context-set locale + device locales into the global
 * `config` on first mount and whenever the context/device values change,
 * so direct callers of `translate(...)` read the right values without
 * needing the hook's return value.
 *
 * Pair with a class-field `_ = translate` (or a direct `import translate
 * from "gettext-universal/build/src/translate.js"`) so the translator is
 * always defined and typechecks cleanly, instead of relying on the
 * `useTranslate()` return value being assigned inside `setup()`.
 *
 * Does NOT fight explicit `config.setLocale(...)` callers — the hook
 * only writes when ITS OWN derived primary/fallback changes, tracked
 * via refs, so a settings picker that calls `setLocale` stays in effect
 * across re-renders.
 *
 * Returns `void`. For the callable-translator pattern, keep using
 * `useTranslate()` / `useTranslateExpo()` — both hooks remain available.
 *
 * @returns {void}
 */
export default function useLocaleExpo() {
  const localeContext = useContext(TranslateContext)
  const locales = useLocales()
  const contextLocale = localeContext?.locale

  const deviceLocales = useMemo(() => {
    if (!Array.isArray(locales)) return []

    return locales
      .map((localeData) => localeData.languageCode)
      .filter(/** @type {(value: string | null) => value is string} */ ((value) => typeof value === "string" && value.length > 0))
  }, [locales])

  const primaryLocale = contextLocale || deviceLocales[0]

  /** @type {React.MutableRefObject<string | null>} */
  const lastWrittenPrimaryRef = useRef(null)

  useEffect(() => {
    if (!primaryLocale) return
    if (lastWrittenPrimaryRef.current === primaryLocale) return

    lastWrittenPrimaryRef.current = primaryLocale
    config.setLocale(primaryLocale)
  }, [primaryLocale])

  /** @type {React.MutableRefObject<string[] | null>} */
  const lastWrittenFallbacksRef = useRef(null)

  useEffect(() => {
    const previous = lastWrittenFallbacksRef.current

    if (previous && previous.length === deviceLocales.length && previous.every((locale, index) => locale === deviceLocales[index])) {
      return
    }

    lastWrittenFallbacksRef.current = deviceLocales
    config.setFallbacks(deviceLocales)
  }, [deviceLocales])

  // Re-render whenever any code calls `config.setLocale(...)` — e.g. a
  // settings picker that swaps the active locale from another screen.
  const [, setTick] = useState(0)

  useEffect(() => {
    /** @returns {void} */
    const onLocaleChange = () => {
      setTick((tick) => tick + 1)
    }

    events.on("onLocaleChange", onLocaleChange)

    return () => {
      events.off("onLocaleChange", onLocaleChange)
    }
  }, [])
}
