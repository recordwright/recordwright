const Locator = require('../../locator-control/class/Locator')
const StepResult = require('./step-result')
const FunctionAST = require('../../function-control/class/Function')
const fs = require('fs').promises
const path = require('path')
class RecordingStep {
    /** 
     * @param {object} recordingStep 
     * @param {'click'|'change'|'dblclick'|'keydown'|'goto'|'upload'|'waitForDownloadComplete'|'waitAndHandleForAlert'|'scroll'|'gotoFrame'|'mousedown'|'dragstart'|'mouseup'|'waitElementExists'|'switchTab'|'mouseover'} recordingStep.command
    * @param {string} recordingStep.target
    * @param {Array<string>} recordingStep.matchedSelector
    * @param {number} recordingStep.timeoutMs
    * @param {string} recordingStep.snapshotPath
    * @param {string} recordingStep.targetPicPath
    * @param {Array<string>} recordingStep.iframe
    * @param {FunctionAST} recordingStep.functionAst
    * @param {Array<Locator>} recordingStep.potentialMatch
    * @param {Array<Locator>} recordingStep.framePotentialMatch
    * @param {number} recordingStep.timestamp
    * @param {number} recordingStep.currentSelectedIndex
    * @param {number} recordingStep.scriptLineNumber
    * @param {string} recordingStep.healingTree
    * @param {string} recordingStep.finalLocatorName
    * @param {string} recordingStep.finalLocator
    * @param {boolean} recordingStep.isRequiredReview
    * @param {boolean} recordingStep.isRequiredLocatorUpdate
    * @param {boolean} recordingStep.isRequiredNewNameAndLocator
    * @param {number} recordingStep.snapshotIndex
    * @param {DOMRect} recordingStep.pos
     */
    constructor(recordingStep) {
        this.pos = recordingStep.pos
        this.command = recordingStep.command
        this.target = recordingStep.target
        /** @type {Array<string>} */
        this.iframe = recordingStep.iframe
        this.potentialMatch = recordingStep.potentialMatch
        this.framePotentialMatch = recordingStep.framePotentialMatch
        this.snapshotIndex = recordingStep.snapshotIndex
        this.snapshotPath = recordingStep.snapshotPath
        this.targetInnerText = recordingStep.targetInnerText
        this.targetPicPath = recordingStep.targetPicPath
        this.timeoutMs = recordingStep.timeoutMs
        this.meta = {}
        this.isRequiredReview = recordingStep.isRequiredReview || false
        this.isRequiredLocatorUpdate = recordingStep.isRequiredLocatorUpdate || false
        this.isRequiredNewNameAndLocator = recordingStep.isRequiredNewNameAndLocator || false

        this.finalLocatorName = ''
        if (recordingStep.finalLocatorName) {
            this.finalLocatorName = recordingStep.finalLocatorName
        }
        this.finalLocator = ''
        if (recordingStep.finalLocator) {
            this.finalLocator = recordingStep.finalLocator
        }
        this.functionAst = recordingStep.functionAst
        if (this.functionAst) {
            this.parameter = JSON.parse(JSON.stringify(recordingStep.functionAst.params))
        }
        this.result = new StepResult()
        this.timeStamp = recordingStep.timestamp
        if (this.timeStamp == null) {
            this.timeStamp = recordingStep.timeStamp
        }
        this.scriptLineNumber = recordingStep.scriptLineNumber
        this.healingTree = recordingStep.healingTree
    }
    /**
     * //based on the searalized json file, re-create object
     * @param {object} json 
     * @param {FunctionAST} functionAst 
     * @param {string} command 
     * @returns {RecordingStep}
     */
    static restore(json, functionAst, command) {
        json.functionAst = functionAst
        let result = new RecordingStep(json)
        let keys = Object.keys(json)
        keys.forEach(key => {
            result[key] = json[key]
        })
        result.command = command
        return result
    }
    get htmlPath() {
        return this.snapshotPath
    }
    set htmlPath(path) {
        this.snapshotPath = path
    }
    setFinalLocator(finalLocatorName, finalLocator) {
        this.finalLocatorName = finalLocatorName
        this.finalLocator = finalLocator
    }
}
/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'|'upload'|'waitForDownloadComplete'|'waitAndHandleForAlert'|'scroll'|'gotoFrame'|'mousedown'|'dragstart'|'mouseup'|'waitElementExists'|'switchTab'} command
 * @property {string} target
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 * @property {string} htmlPath
 * @property {string} targetPicPath
 * @property {Array<string>} iframe
 * @property {import('../../ast/class/Function')} functionAst
 * @property {Array<RecordingStep>} potentialMatch
 * @property {Array<RecordingStep>} framePotentialMatch
 * @property {number} timestamp
 * @property {number} currentSelectedIndex
 * @property {number} scriptLineNumber
 * @property {string} healingTree
 * @property {string} finalLocatorName
 * @property {string} finalLocator
 * @property {boolean} isRequiredReview
 * @property {boolean} isRequiredLocatorUpdate
 * @property {boolean} isRequiredNewNameAndLocator
 */
module.exports = RecordingStep