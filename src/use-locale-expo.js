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
 * Returns the currently active locale string from `config.getLocale()`
 * (or `undefined` when no locale has been set yet) so callers can pass
 * it as a `useEffect` dependency. The hook's own `setTick` subscription
 * to `onLocaleChange` makes the return value reactive — including
 * imperative `config.setLocale(...)` calls from a settings picker that
 * does not also push through `TranslateContext`. For the callable-
 * translator pattern, keep using `useTranslate()` / `useTranslateExpo()`
 * — both hooks remain available.
 *
 * @returns {string | undefined}
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

  // Re-render whenever any code calls `config.setLocale(...)` — e.g. a
  // settings picker that swaps the active locale from another screen.
  //
  // Must subscribe BEFORE the primary/fallbacks `useEffect`s below —
  // those call `config.setLocale(...)` which emits `onLocaleChange`, and
  // without a live listener the first-mount sync of a stale `config`
  // would be silently missed, leaving the component rendering stale
  // translations from `translate(...)` until an unrelated re-render.
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

  // Read the authoritative locale from `config` (rather than returning the
  // derived `primaryLocale`) so an imperative `config.setLocale("de")` from a
  // settings picker — which emits `onLocaleChange` and re-renders this hook
  // via `setTick` above — surfaces in the return value too. Returning
  // `primaryLocale` would miss those overrides whenever the host app does not
  // also push the new locale through `TranslateContext`.
  return config.getLocale()
}
