
const { test, Page, Frame, ElementHandle } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const findElement = require('./findElement')
/**
 * Change Value in Element
 * @param {Object} input
 * @param {Frame} input.frame 
 * @param {ElementSelector} input.element
 * @param {string} input.text Text value you want to change to
 */
exports.change = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Change value in '${input.element.displayName}' to ${input.text}`
        }
        /**
         * 
         * @param {ElementHandle} element 
         * @param {string} desiredValue
         * @returns {Promise<boolean>}
         */
        async validateValue(element, desiredValue) {
            let currentValue = await element.evaluate(item => {
                return item.value
            })
            return currentValue == desiredValue

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
                let element = await findElement(input.frame, input.element)

                //Use fill to fill in value

                try {
                    await element.fill('', { force: true })
                    await element.fill(text, { force: true })
                    let isResultValid = await this.validateValue(element)
                    if (isResultValid)
                        return "Value Changed successfully"
                } catch (error) {

                }
                //use type to populate value
                try {
                    await element.evaluate(el => el.value = '');
                    await element.type(text, { delay: 100 })
                    let isResultValid = await this.validateValue(element)
                    if (isResultValid)
                        return 'Value Changed successfully'

                } catch (error) {

                }


                //ensure the value has been changed correctly
                let currentValue = await element.evaluate(el => el.value);

                //if current value cannot be changed via typing text, set value directly
                let startTime = Date.now()
                let text = input.text
                while (currentValue != text) {
                    await element.evaluate(el => el.blur());
                    await element.evaluate((el, text) => el.value = text, text);
                    await element.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })));
                    //wait for 500ms and confirm if change went through
                    await new Promise(resolve => setTimeout(resolve, 500))

                    let isValidateSuccess = await this.validateValue(element, input.text)
                    if (isValidateSuccess) {
                        break
                    }
                    //allow the maximum timeout of 10s to change value
                    if ((Date.now() - startTime) > 10000) {
                        assert.fail(`Unable to change "${elementSelector.displayName}" to value "${text}" in 10s`)
                    }
                }
            } catch (error) {
                throw new Error(`Unable to Change Element: ${input.element.displayName} to desired value: ${input.text}`)
            }
            return 'Value Changed Correctly'
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}


