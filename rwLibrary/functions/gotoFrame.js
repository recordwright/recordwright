
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const findElement = require('./findElement')
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
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
                element = await findElement(input.frame, input.element)

                let frame = await element.contentFrame()
                return frame
            } catch (error) {
                return Promise.reject(`Unable to go to frame:${input.element.displayName}    Error: ${error}`)
            }
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


