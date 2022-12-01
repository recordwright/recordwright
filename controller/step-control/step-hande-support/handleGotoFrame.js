const RecordingStep = require('../class/recording-step')
const FunctionControl = require('../../function-control')

/**
 * Analyze if there is a change in the page. If page is different from prior
 * step, add bringPageToFront step at the beginning
 * @param {RecordingStep[]} stepList
 * @param {RecordingStep} step
 * @param {FunctionControl} functionControl
 * @param {Function} handleWaitForElement
 */
function handleGotoFrame(stepList, step, functionControl, handleWaitForElement) {
    let gotoFrame = 'gotoFrame'
    let lastFrame = ''

    stepList.forEach(item => {
        lastFrame = item.iframe
    })

    //if last frame is the same as current frame, we will not add additional goto frame step
    if (step.iframe == lastFrame) {
        return stepList
    }

    //if current step does not have element selector, there is no need to switch frame
    let elementSelectorParam = step.functionAst.params.find(item => item.type.name == 'ElementSelector')
    if (elementSelectorParam == null)
        return stepList

    //curent iframe is different from prior step, add wait for current iframe

    let functionAst = functionControl.store.getFunction(gotoFrame)
    let newStep = RecordingStep.restore(step, functionAst, gotoFrame)

    //update elementSelector to match current step
    newStep.potentialMatch = newStep.framePotentialMatch
    newStep.target = newStep.iframe
    newStep.finalLocator = ''
    newStep.finalLocatorName = ''
    if (newStep.framePotentialMatch.length == 1) {
        newStep.finalLocator = newStep.framePotentialMatch[0].Locator
        newStep.finalLocatorName = newStep.framePotentialMatch[0].path
    }
    //add waitForElement for current frame because frame loading could be time consuming too.
    stepList = handleWaitForElement(stepList, newStep, functionControl)

    //after add wait for element, push gotoFrame step into list
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
module.exports = handleGotoFrame