import config from "../src/config.js"
import events from "../src/events.js"
import translate from "../src/translate.js"

describe("gettext-universal", () => {
  it("falls back to the given msgId", () => {
    config.setLocale("en")
    config.locales = {
      en: {}
    }

    const result = translate("Hello world")

    expect(result).toEqual("Hello world")
  })

  it("replaces placeholders with variables", () => {
    config.setLocale("en")
    config.locales = {
      "en": {
        "Hello name": "Hello %{name}"
      }
    }

    const result = translate("Hello name", {name: "Kasper"})

    expect(result).toEqual("Hello Kasper")
  })

  it("replaces placeholders with variables in defaults", () => {
    config.setLocale(null)
    config.locales = {
      "en": {
        "Hello world": "Hello world"
      }
    }

    const result = translate("Hello %{name}", {name: "Kasper"})

    expect(result).toEqual("Hello Kasper")
  })

  describe("setLocale with a function resolver", () => {
    afterEach(() => {
      config.setLocale(null)
    })

    it("getLocale returns the resolver's current value on each call", () => {
      let currentLocale = "da"

      config.setLocale(() => currentLocale)

      expect(config.getLocale()).toEqual("da")

      currentLocale = "de"

      expect(config.getLocale()).toEqual("de")
    })

    it("translate uses the resolver's locale to pick the right translation", () => {
      config.locales = {
        en: {Greeting: "Hello"},
        da: {Greeting: "Hej"}
      }
      config.setFallbacks(["en"])

      let currentLocale = "da"

      config.setLocale(() => currentLocale)

      expect(translate("Greeting")).toEqual("Hej")

      currentLocale = "en"

      expect(translate("Greeting")).toEqual("Hello")
    })

    it("does not emit onLocaleChange when setLocale receives a function", () => {
      const emitted = []

      events.on("onLocaleChange", (payload) => emitted.push(payload))

      config.setLocale(() => "fr")

      expect(emitted.length).toEqual(0)
    })

    it("emits onLocaleChange with the locale when setLocale receives a string", () => {
      const emitted = []

      events.on("onLocaleChange", (payload) => emitted.push(payload))

      config.setLocale("da")

      expect(emitted.length).toEqual(1)
      expect(emitted[0]).toEqual({locale: "da"})
    })

    it("getLocale returns undefined when the resolver returns undefined", () => {
      config.setLocale(() => undefined)

      expect(config.getLocale()).toBeUndefined()
    })
  })
})
