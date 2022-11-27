const { test, Frame } = require('@playwright/test')
class BasePlayWrightFunction {
    /**
     * Make current function visible when specified condition is met
     * @param {Frame}
     * @returns {boolean}
     */
    async isVisible(frame) {
        return true
    }
    async func() {
        throw new Error('This function has not been implemented')
    }
    async run() {
        let logInfo = await this.getLog()
        await test.step(logInfo, async () => {
            await this.func(this.input)
        })
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

        //otherwise, just run function associated with this class
        let result = await classVar.run()
        return result

    }

}
module.exports = BasePlayWrightFunction