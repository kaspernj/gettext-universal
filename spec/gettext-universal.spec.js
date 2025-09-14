import config from "../src/config.js"
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
})
