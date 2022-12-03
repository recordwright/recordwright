const RecordingStep = require('../class/recording-step')
const FunctionControl = require('../../function-control')

/**
 * Analyze if there is a change in the page. If page is different from prior
 * step, add bringPageToFront step at the beginning
 * @param {RecordingStep[]} stepList
 * @param {RecordingStep} step
 */
function handleUnimplementedFunc(stepList, step) {
    if (step.functionAst == null) {
        throw (`Function not implemented: "${step.command}"`)
    }
    return stepList

}
module.exports = handleUnimplementedFunc