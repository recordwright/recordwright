
const { test, Page, Frame, ElementHandle } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const HealingSnapshot = require('../class/HealingSnapshot')
const findElement = require('./findElement')
/**
 * Wait for element to exists
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
 * @param {Number} input.timeout Maximum timeout. Unit ms
 * @param {HealingSnapshot} input.healingSnapshot
 * @returns {ElementHandle} 
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
            try {
                let startTime = Date.now()
                let elapsedTime = 0
                while (elapsedTime < input.timeout) {
                    let element = await findElement(input.frame, input.element, input.healingSnapshot)
                    if (element != null)
                        return element
                    elapsedTime = Date.now() - startTime
                }
            } catch (error) {

            }
            throw new Error(`Unable to Find Element:${input.element.displayName} in ${input.timeout} ms`)




        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


