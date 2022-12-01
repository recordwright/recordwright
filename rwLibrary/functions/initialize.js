
const { test, Page, Frame, Browser, BrowserContext } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const findElement = require('./findElement')
class LaunchResult {
    /**
     * 
     * @param {BrowserContext} context 
     * @param {Page} page 
     * @param {Frame} frame 
     */
    constructor(context, page, frame) {
        this.context = context
        this.page = page
        this.frame = frame
    }
}
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Browser} input.browser 
 * @returns {LaunchResult}
 */
exports.initialize = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Launch Browser`
        }
        /**
         * Perform functions
         * @returns 
         */
        async func() {
            try {
                let browser = input.browser
                let context = browser.contexts()[0]
                let page = context.pages()[0]
                let frame = page.mainFrame()
                let result = new LaunchResult(context, page, frame)
                return result
            } catch (error) {
                return Promise.reject(`Unable to go to lauch browser   Error: ${error}`)
            }
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


