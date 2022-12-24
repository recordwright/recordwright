
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../../../rwLibrary/class/ElementSelector')
const RecordwrightFunc = require('../../../rwLibrary/class/RecordwrightFunc')
const LocatorControl = require('../../../controller/locator-control')
const locator = require('../recordwright-locator')
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
 * @param {Number} input.x x-coorindation offset in terms of percentage. Scale of 1
 * @param {Number} input.y x-coorindation offset in terms of percentage. Scale of 1
 */
exports.click1 = async function (input) {
    class mainClass extends RecordwrightFunc {
        /**
         * Make current function visible when specified condition is met
         * @param {object} input
         * @param {LocatorControl} input.locatorControl
         * @returns {boolean}
         */
        async isVisible(input) {
            return input.locatorControl.getIsLocatorActive(locator['input'])
        }
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

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


