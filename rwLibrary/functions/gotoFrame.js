
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const findElement = require('./findElement')
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Page} input.page 
 * @param {ElementSelector} input.element
 * @returns {Frame}
 */
exports.gotoFrame = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Go to Frame ${input.element.displayName}`
        }
        /**
         * Perform functions
         * @returns 
         */
        async func() {
            try {
                let element = null
                element = await findElement(input.page, input.element)
                let frame = await element.contentFrame()
                if (frame == null) {
                    frame = input.page.mainFrame()
                }
                return frame
            } catch (error) {
                throw new Error(`Unable to go to frame:${input.element.displayName}`)
            }
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


