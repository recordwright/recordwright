const RecordingStep = require('../class/recording-step')

/**
 * Analyze if there is a change in the page. If page is different from prior
 * step, add bringPageToFront step at the beginning
 * @param {RecordingStep[]} stepList
 * @param {RecordingStep} step
 */
function handleBringPageToFront(stepList, step) {
    let contextIndex = step.contextIndex
    //find prior context index before this step
    let lastContextIndex = 0
    stepList.forEach(item => {
        lastContextIndex = item.contextIndex
    })
    //if current context index equal to last context index, return as is
    if (contextIndex == lastContextIndex) {
        return stepList
    }

    //if current context index is different. Add step to switch context
    let stepJson = JSON.stringify(step)
    RecordingStep.restore(step,)


}
module.exports = handleBringPageToFront