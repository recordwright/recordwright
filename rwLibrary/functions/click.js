
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const findElement = require('./findElement')
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
 * @param {Number} input.x x-coorindation offset in terms of percentage. Scale of 1
 * @param {Number} input.y x-coorindation offset in terms of percentage. Scale of 1
 */
exports.click = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Click in ${input.element.displayName}`
        }
        /**
         * Perform functions
         * @returns 
         */
        async func() {
            try {
                /**
                 * click on element based on the size
                 */
                let locator = await findElement(input.frame, input.element)
                await locator.hover({ force: true })
                let rect = await locator.boundingBox()
                if (input.x == null) input.x = 0.5
                if (input.y == null) input.y = 0.5
                let x = rect.width * input.x
                let y = rect.height * input.y
                await locator.click({ position: { x: x, y: y }, force: true })
            } catch (error) {
                throw new Error(`Unable to Click Element: ${input.element.displayName}`)
            }
            return true
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


