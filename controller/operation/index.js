const FunctionControl = require('../function-control')
const LocatorControl = require('../locator-control')
const BrowserControl = require('../browser-control')
const StepControl = require('../step-control')
class Operation {
    /**
     * 
     * @param {FunctionControl} functionControl 
     * @param {LocatorControl} locatorControl 
     * @param {BrowserControl} browserControl
     * @param {StepControl} stepControl
     */
    constructor(functionControl, locatorControl, browserControl, stepControl) {
        this._functionControl = functionControl
        this._locatorControl = locatorControl
        this._browserControl = browserControl
        this._stepControl = stepControl
        /**
         * @type {import('../function-control/class/Function')}
         */
        this.activeFunctionAst = null
        /** @type {string[]} */
        this.functionCategories = []
        /**
         * @type {import('../function-control/class/Function')[]}
         */
        this.activeFunctionList = []
    }
    /**
     * Update function categories
     */
    updateFunctionCategory() {
        let tagList = this._functionControl.store.funcRepo.map(item => item.defaultGUITag)
        this.functionCategories = [...new Set(tagList)]
    }
    /**
     * Get if current function is active based on the function category function
     */
    async updateActiveFunctionList() {
        let locatorControl = this._locatorControl
        let visibleFuncList = []
        try {
            for (let item of this._functionControl.store.funcRepo) {
                let isFuncVisible = await item.mainFunc({ runGetVisiabilityFunc: true, locatorControl: locatorControl })
                if (isFuncVisible)
                    visibleFuncList.push(item)
            }
            this.activeFunctionList = visibleFuncList
        } catch (error) {
            console.log()

        }

    }


}

module.exports = Operation