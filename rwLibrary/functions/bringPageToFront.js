
const { test, Browser, BrowserContext } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
class BringContextToFrontResult {
    /**
     * 
     * @param {BrowserContext} context 
     */
    constructor(context) {
        this.context = context
        this.page = context.pages()[0]
        this.frame = this.page.mainFrame()

    }
}
/**
 * Bring browser context to front
 * @param {Object} input
 * @param {Browser} input.browser 
 * @param {Number} input.index Index of browser. Start from 0
 * @returns {BringContextToFrontResult}
 */
exports.bringPageToFront = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Bring Page to front. Index: ${input.index}`
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
                let contextList = input.browser.contexts()
                let context = contextList[input.index]
                let page = context.pages()[0]
                await page.bringToFront()
                let result = new BringContextToFrontResult(context)
                return result
            } catch (error) {
                return Promise.reject(`Unable to Bring Page into view. Index:${input.index}    Error: ${error}`)
            }
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


