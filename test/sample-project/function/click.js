
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const BluestoneFunc = require('../class/BaseRecordWrightFunction')
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
 * @param {Number} input.x x-coorindation offset in terms of percentage. Scale of 1
 * @param {Number} input.y x-coorindation offset in terms of percentage. Scale of 1
 */
async function click(input) {
    class mainClass extends BluestoneFunc {
        constructor() {
            super()
            this.locators = [{ locator: ['invalid_locator'] }]
            this.log = `Click in ${input.element.displayName}`
        }

        async func() {
            try {
                let locator = await input.frame.locator(input.element.locator)
                let rect = await locator.boundingBox()
                let x = rect.width * input.x
                let y = rect.height * input.y
                await locator.click({ position: { x: x, y: y }, force: true })
            } catch (error) {
                return Promise.reject(`Unable to Click Element:${input.element.displayName}    Error: ${error}`)
            }
            return true
        }

    }

    let result = await BluestoneFunc.entry(mainClass, input)
    return result

}

module.exports = click
