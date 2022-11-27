
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const HealingSnapshot = require('../class/HealingSnapshot')
const findElement = require('./findElement')
/**
 * Click UI Element at against coordaination
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
 * @param {Number} input.timeout Maximum timeout
 * @param {HealingSnapshot} input.healingSnapshot
 * 
 */
exports.waitforElement = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Wait for element "${input.element.displayName}" in ${input.timeout} ms`
        }
        async func() {

            /**
             * click on element based on the size
             */

            let startTime = Date.now()
            let elapsedTime = 0
            while (elapsedTime < input.timeout) {
                let element = await findElement(input.frame, input.element, input.healingSnapshot)
                if (element != null)
                    return element
                elapsedTime = Date.now() - startTime
            }

            return Promise.reject(`Unable to Click Element:${input.element.displayName}    Error: ${error}`)

        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}

