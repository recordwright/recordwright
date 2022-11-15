let RecordingStep = require('./class/recording-step')
class StepControl {
    constructor() {
        /**@type {RecordingStep[]} */
        this.steps = []
        /** @type {RecordingStep} */
        this._hoveredElement = null
    }
    addStep(step) {

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
}
module.exports = StepControl