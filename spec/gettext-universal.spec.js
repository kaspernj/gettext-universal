import translate from "../src/translate.js"

describe("gettext-universal", () => {
  it("falls back to the given msgId", () => {
    const result = translate("Hello world")

    expect(result).toEqual("Hello world")
  })
})
