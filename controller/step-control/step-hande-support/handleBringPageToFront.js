const RecordingStep = require('../class/recording-step')
const FunctionControl = require('../../function-control')

/**
 * Analyze if there is a change in the page. If page is different from prior
 * step, add bringPageToFront step at the beginning
 * @param {RecordingStep[]} stepList
 * @param {RecordingStep} step
 * @param {FunctionControl} functionControl
 */
function handleBringPageToFront(stepList, step, functionControl) {
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
    let functionAst = functionControl.store.getFunction('bringPageToFront')
    let bringPageToFrontStep = RecordingStep.restore(step, functionAst, 'bringPageToFront')
    stepList.push(bringPageToFrontStep)
    return stepList

}
module.exports = handleBringPageToFront