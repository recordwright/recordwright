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

    let waitCommand = 'waitforElement'

    let isAddWaitResultRequired = getAddWaitRequired(step)
    if (!isAddWaitResultRequired)
        return stepList
    //will not add wait step for those function who does not need to interact with specific element


    //if current context index is different. Add step to switch context
    let functionAst = functionControl.store.getFunction(waitCommand)
    let newStep = RecordingStep.restore(step, functionAst, waitCommand)

    //update elementSelector to match current step
    let newElementSelectorIndex = newStep.functionAst.params.findIndex(item => item.type.name == 'ElementSelector')
    let stepElementSelectorIndex = step.functionAst.params.findIndex(item => item.type.name == 'ElementSelector')
    newStep.functionAst.params[newElementSelectorIndex].value = step.functionAst.params[stepElementSelectorIndex].value

    //update timeout
    let newTimeoutIndex = newStep.functionAst.params.findIndex(item => item.name == 'timeout')
    let newWaitTime = step.timeoutMs
    if (newWaitTime < 3000) newWaitTime = 3000
    newStep.functionAst.params[newTimeoutIndex].value = newWaitTime

    stepList.push(newStep)
    return stepList

}
/**
  * @param {RecordingStep} step

 */
function getAddWaitRequired(step) {
    let elementSelectorParam = step.functionAst.params.find(item => item.type.name == 'ElementSelector')
    let result = true
    ////will not add wait step for those function who does not need to interact with html element
    if (elementSelectorParam == null) {
        result = false
    }
    // will not add step if current step is waitForElement already
    if (step.command == 'waitForElement') {
        result = false
    }

    //will not add step if current steps timeout is 0
    if (step.timeoutMs == 0) {
        result = false
    }

    return result





}
module.exports = handleBringPageToFront