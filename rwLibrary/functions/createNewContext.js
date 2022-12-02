
const { test, Page, Frame, Browser } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const HealingSnapshot = require('../class/HealingSnapshot')
const findElement = require('./findElement')
class CreateNewContextResult {
    constructor(page, frame) {
        this.page = page
        this.frame = frame
    }
}
/**
 * Navigate browser to specific url
 * @param {Object} input
 * @param {Browser} input.browser 
 * @returns {CreateNewContextResult}
 */
exports.createNewContext = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            let contexts = input.browser.contexts()
            return `Create Browser Context No.${contexts.length - 1}"`
        }
        async func() {
            let context = await input.browser.newContext()
            let page = await context.newPage()
            let frame = page.mainFrame()
            let result = new CreateNewContextResult(page, frame)
            return result
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}

