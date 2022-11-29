let RecordingStep = require('./class/recording-step')
let FunctionControl = require('../function-control')
const handleBringPageToFront = require('./step-hande-support/handleBringPageToFront')
const handleWaitForElement = require('./step-hande-support/handleWaitForElement')
class StepControl {
    /**
     * 
     * @param {FunctionControl} funcControl 
     */
    constructor(funcControl) {
        /**
         * This is used to store final step information
         * @type {RecordingStep[]} 
         * */
        this.steps = []
        /** @type {RecordingStep} */
        this._hoveredElement = null
        this.lastStepTimeStamp = Date.now()
        this.funcControl = funcControl
        /**
         * This is used to store raw steps. Raw steps can be used to accelerate step update 
         * @type {RecordingStep[]} 
         * */
        this._rawStepRepo = []
    }
    addStep(step) {
        this.lastStepTimeStamp = Date.now()
        this._rawStepRepo.push(step)
        this.steps = handleBringPageToFront(this.steps, step, this.funcControl)
        this.steps = handleWaitForElement(this.steps, step, this.funcControl)
        this.steps.push(step)
    }
    get hoveredElement() {
        return this._hoveredElement
    }
    /**
     * @param {RecordingStep} targetElement
     */
    set hoveredElement(targetElement) {
        this._hoveredElement = targetElement
    }
    /**
     * update recommended locator for current selected element
     * @returns 
     */
    exposeUpdateRecommendedLocators() {
        let context = this
        function updateRecommendedLocators(recommendedLocator) {
            context._hoveredElement.recommendedLocators = recommendedLocator.map(item => item.locator)
        }
        return updateRecommendedLocators
    }

}
module.exports = StepControl