const { test } = require('@playwright/test')
class BasePlayWrightFunction {
    /**
     * Make current function visible when specified locator all appear
     * @returns {string[]}
     */
    async getLocator() {
        console.log(`getLocator Function is not implemented`)
        test.fail()
    }
    async func() {
        throw new Error('This function has not been implemented')
    }
    async run() {
        let logInfo = await this.getLog()
        await test.step(logInfo, async () => {
            await this.func(this.input)
        })
        console.log('hello world!')
    }
    /**
     * This is step information for current operation
     * @returns {string}
     */
    async getLog() {
        console.log(`getLog Function is not implemented`)
        test.fail()
    }
    /**
     * based on the information, perform opeartion
     * @param {object} className the main class that host the function
     * @param {object} input input forr the lcass
     */
    static async entry(className, input) {
        /**
         * @type {BasePlayWrightFunction}
         */
        let classVar = new className()
        // if getLocator flag appear, return locator instead of running function
        if (input.getLocator) {
            /**
             * @type {string[]}
             */
            let locators = await classVar.getLocator()
            return locators
        }

        //otherwise, just run function associated with this class
        let result = await classVar.run()
        return result

    }

}
module.exports = BasePlayWrightFunction