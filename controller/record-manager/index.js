const LocatorControl = require('../locator-control')
let config = require("../../config")
const BrowserControl = require('../browser-control/index')
const StepControl = require('../step-control/index')
const RuntimeSetting = require('./class/record-runtime-setting')
const RecordingStep = require('../step-control/class/recording-step.js')
const FunctionControl = require('../function-control/index')
class RecordManager {
    constructor({
        io, locatorPath = config.code.locatorPath,
        inbuiltFuncPath = config.code.inbuiltFuncPath,
        userFuncPath = config.code.funcPath
    } = {}) {
        this.io = io
        this.locatorControl = new LocatorControl(locatorPath)
        this.browserControl = new BrowserControl(config.recordwright.use, io)
        this.stepControl = new StepControl()
        this.funcDict = this._initFuncDict()
        this.runtimeSetting = new RuntimeSetting()
        // this.functionControl = new FunctionControl(locatorPath)
        // this.functionControl.store.loadFunctions(inbuiltFuncPath)
        // this.functionControl.store.loadFunctions(userFuncPath)
    }
    async waitForInit() {
        await this.browserControl.waitForInit()
    }
    async start({ headless = false } = {}) {
        await this.browserControl.createBrowserContext({ headless, exposedFunc: this.funcDict })
    }
    /**
     * Convert event detail from browser to RecordingStep
     * @param {RecordingStep} eventDetail 
     * @param {string} backupTargetLocator
     * @param {number} lastOperationTime
     */
    convertEventDetailToRecordingStep(eventDetail, backupTargetLocator = '', lastOperationTime = Date.now()) {
        let snapshotIndex = this.browserControl.activeSnapshotWorker.records.length - 1
        let snapshotPath = this.browserControl.activeSnapshotWorker.records[snapshotIndex].path
        let framePotentialMatch = eventDetail.potentialMatch.map(index => this.locatorControl.locatorLibrary[index])
        framePotentialMatch = JSON.parse(JSON.stringify(framePotentialMatch))

        let potentialMatch = eventDetail.potentialMatch.map(index => this.locatorControl.locatorLibrary[index])
        potentialMatch = JSON.parse(JSON.stringify(potentialMatch))

        //specify final locator
        let finalLocator = ''
        let finalLocatorName = ''
        if (eventDetail.currentSelectedIndex != null) {
            //if element's final index has been specified, use that
            let locator = this.locatorControl.locatorLibrary[eventDetail.currentSelectedIndex]
            finalLocator = locator.Locator
            finalLocatorName = locator.path
        }
        else if (eventDetail.potentialMatch.length == 1) {
            //specify final locator based on potential match
            let index = eventDetail.potentialMatch[0]
            let locator = this.locatorControl.locatorLibrary[index]
            finalLocator = locator.Locator
            finalLocatorName = locator.path
        }

        //in case the element is destroyed after the event, we will get the locator from last hovered element
        if (eventDetail.target == null || eventDetail.target == '') {
            eventDetail.target = backupTargetLocator
        }

        //update timeout based on last operation time
        eventDetail.timeoutMs = Date.now() - lastOperationTime

        eventDetail.finalLocatorName

        let recordingStep = new RecordingStep({
            ...eventDetail,
            potentialMatch: potentialMatch,
            framePotentialMatch: framePotentialMatch,
            snapshotIndex: snapshotIndex,
            snapshotPath: snapshotPath,
            finalLocator,
            finalLocatorName
        })
        return recordingStep
    }
    exposeLogEvent() {
        let context = this
        /**
         * 
         * @param {import('../step-control/class/recording-step.js')} eventDetail 
         * @returns 
         */
        return async function logEvent(eventDetail) {

            //skip steps that is in the mute list
            if (context.runtimeSetting.blackList.includes(eventDetail.command)) {
                return
            }
            //stop recording right away when we press ctrl+q
            if (eventDetail.command == null) {
                context.runtimeSetting.stopRecordingWithGracePeriod()
            }



            let recordingStep = context.convertEventDetailToRecordingStep(eventDetail, context.stepControl.hoveredElement.target, context.stepControl.lastStepTimeStamp)
            //if event command is null, call the in-browser console
            if (recordingStep.command == null) {
                //bring ui into focus
                console.log('pause recording and call in-browser agent')
                //TODO: implement UI switch operation
                // await openBluestoneTab(browser, "decide-view")
            }

            //based on record setting decide if we should proceed recording
            if (!context.runtimeSetting.isAcceptNewStep) return

            //calculate timeout by subtracting current time to the time from previous step


            try {
                let commandFuncAst = recordRepo.astManager.getFunction(event.command)
                event.functionAst = commandFuncAst
                //parse in argument into parameter
                if (eventDetail.parameter != null) {
                    let paramIndex = event.functionAst.params.findIndex(item => { return item.type.name == 'Number' || item.type.name == 'string' || item.type.name == 'number' || item.type.name == 'Number' })
                    event.functionAst.params[paramIndex].value = eventDetail.parameter

                    try {
                        let paramterObj = JSON.parse(eventDetail.parameter)
                        let paramNameList = Object.keys(paramterObj)
                        for (const paramName of paramNameList) {
                            let funcParam = event.functionAst.params.find(funcParam => funcParam.name == paramName)
                            if (funcParam == null) continue
                            funcParam.value = paramterObj[paramName]
                        }

                    } catch (error) {

                    }

                }
            } catch (error) {
                console.log(`Cannot find command ${event.command}`)
            }
            if (eventDetail.currentSelectedIndex) {
                let selectedLocator = recordRepo.locatorManager.locatorLibrary[eventDetail.currentSelectedIndex]
                event.finalLocatorName = selectedLocator.path
                event.finalLocator = selectedLocator.Locator
            }


            await recordRepo.addStep(event)
            //bring up notification on bluestone if there is more than 1 potential match
            //or the final element has not been set
            let isElementDefined = event.potentialMatch.length == 1 || event.finalLocatorName != ''
            if (!isElementDefined) {
                recordRepo.puppeteer.sendUndefinedLocatorNotification()
            }

            // console.log(JSON.stringify(recordRepo.steps))
            //update last operation time



        }
    }
    exposeLogCurrentElement() {
        let context = this
        /**
         * 
         * @param {import('../step-control/class/recording-step')} eventDetail 
         * @returns 
         */
        async function logCurrentElement(eventDetail) {
            //if current selector has been captured, we will not capture it again
            try {
                context.stepControl.hoveredElement = context.convertEventDetailToRecordingStep(eventDetail)
            } catch (error) {
                console.log(error)
            }


        }
        return logCurrentElement
    }
    _initFuncDict() {
        return {
            setActiveLocator: this.locatorControl.exposeSetActiveLocator(),
            getActiveSelectors: this.locatorControl.exposeGetActiveSelectors(),
            getDefinedLocator: this.locatorControl.exposeGetDefinedLocator(),
            logCurrentElement: this.exposeLogCurrentElement(),
            logEvent: this.exposeLogEvent(),
            updateRecommendedLocators: this.stepControl.exposeUpdateRecommendedLocators()
        }
    }

}
module.exports = RecordManager