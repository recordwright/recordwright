const LocatorControl = require('../locator-control')
let config = require("../../config")
const BrowserControl = require('../browser-control/index')
const StepControl = require('../step-control/index')
const RuntimeSetting = require('./class/record-runtime-setting')
class RecordManager {
    constructor(io) {
        this.io = io
        this.locatorControl = new LocatorControl(config.code.locatorPath)
        this.browserControl = new BrowserControl(config.recordwright.use, io)
        this.stepControl = new StepControl()
        this.funcDict = this._initFuncDict()
        this.runtimeSetting = new RuntimeSetting()
    }
    async waitForInit() {
        await this.browserControl.waitForInit()
    }
    async start({ headless = false } = {}) {
        await this.browserControl.createBrowserContext({ headless, exposedFunc: this.funcDict })
    }
    exposeAddStep() {
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
                context.runtimeSetting.isRecording = false
                recordStopTimeStamp = Date.now()
            }
            //goto command does not generate a locator, we w

            //handle locator potential match
            let locatorPotentialMatch = eventDetail.potentialMatch

            if (eventDetail.healingTree) {
                recordRepo.operation.browserSelection.atomicTree = eventDetail.healingTree
            }
            //handle frame potential match
            let framePotentialMatch = []
            try {
                let matchedList = JSON.parse(eventDetail.framePotentialMatch)
                for (index of matchedList) {
                    let locatorObj = JSON.parse(JSON.stringify(recordRepo.locatorManager.locatorLibrary[index]))
                    framePotentialMatch.push(locatorObj)
                }


            } catch (error) {

            }
            //handle page capture

            let htmlPath = ''
            if (page != null && recordRepo.isCaptureHtml) {
                htmlPath = recordRepo.getHtmlPath()
                recordRepo.htmlCaptureStatus.outputHtml(htmlPath)

            }
            //handle screenshot

            let picturePath = ''



            if (page != null) {
                picturePath = recordRepo.getPicPath()
                //avoid tab switch if we are dealing with the same page
                if (page == recordRepo.puppeteer.page && eventDetail.command == 'switchTab') {
                    return
                }
                recordRepo.puppeteer.setPage(page)


                if (eventDetail.target == '') {
                    //handle those element that will be destroyed right after interaaction
                    picturePath = recordRepo.operation.browserSelection.selectorPicture
                    locatorPotentialMatch = recordRepo.operation.browserSelection.potentialMatch
                }
                else {
                    //handle 2 scenario, if current event is gone before we capture that, we will just use last mouse position
                    if (eventDetail.command == null || (eventDetail.pos.x == 0 && eventDetail.pos.y == 0)) {
                        //for operation coming custozied operation
                        recordRepo.picCapture.outputCurrentPic(recordRepo.operation.browserSelection.x, recordRepo.operation.browserSelection.y, recordRepo.operation.browserSelection.width, recordRepo.operation.browserSelection.height, picturePath);
                    }
                    else {
                        //for ordinary event, just crop as usual
                        recordRepo.picCapture.outputCurrentPic(eventDetail.pos.x, eventDetail.pos.y, eventDetail.pos.width, eventDetail.pos.height, picturePath);
                    }

                }
            }
            //in case the element is destroyed after the event, we will get the locator from last hovered element
            if (eventDetail.target == null || eventDetail.target == '') {
                eventDetail.target = recordRepo.operation.browserSelection.currentSelector
            }


            //if event command is null, call the in-browser console
            if (eventDetail.command == null) {
                //cache the page inforamtion. After we finish agent page
                //it will go back to the orginal page

                await takeScreenshotForLocatorDefiner(page)
                // recordRepo.isCaptureHtml = false

                recordRepo.spyBrowserSelectionPicPath = picturePath
                // recordRepo.spyBrowserSelectionHtmlPath = htmlPath
                console.log('pause recording and call in-browser agent')
                recordRepo.spyVisible = true
                //populate group info
                try {
                    //TODO: This function is causing performance issue
                    await recordRepo.refreshActiveFunc()

                } catch (error) {
                    recordRepo.operation.spy.result.isPass = false
                    recordRepo.operation.spy.result.text = `Unable to load bluestone-func.js: ${error.toString()}`
                }

                let task1 = recordRepo.getRecommendedLocatorFromDefiner(recordRepo.operation.browserSelection.currentSelector, eventDetail.iframe)
                //display pending work progress
                await drawPendingWorkProgress(page, recordRepo.picCapture, recordRepo.htmlCaptureStatus, task1)


                //display mvt console
                // recordRepo.isCaptureHtml = false
                await openBluestoneTab(browser, "decide-view")

                //give 5000ms delay so that it can capture unfinished events
                //use case:
                //In a login page, change the username and password
                //Right after password is changed, use ctrl+q to call out bluestone agent
                //In this case, the last password change event will be neglected. 
                //With this challenge, that's why we need to wait for 5000ms
                //or in brm, some of the change event will be triggered after 5s?!




            }
            //delayed record. 
            //normally, if we are in recording state, we will log step anyway
            //if we are not in recording state, we will still log steps for 5s to avoid missing delayed events
            if ((recordRepo.isRecording || (Math.abs(recordStopTimeStamp - eventDetail.timestamp) < 5000)) && eventDetail.command != null) {
                //If we don't have page element, this indicates that it is a non-UI operation,
                //we will not calculate timeout
                let timeoutMs = null
                if (page != null) {
                    timeoutMs = Date.now() - recordRepo.operation.browserSelection.lastOperationTime
                }
                if (eventDetail.timeoutMs == null) {
                    eventDetail.timeoutMs = timeoutMs
                }

                //calculate timeout by subtracting current time to the time from previous step

                eventDetail.targetPicPath = picturePath
                eventDetail.htmlPath = [htmlPath]
                eventDetail.potentialMatch = locatorPotentialMatch
                eventDetail.framePotentialMatch = framePotentialMatch
                //construct operation event
                let event = new RecordingStep(eventDetail)
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

            // setTimeout(() => {
            //     try {
            //         if (io) io.emit(WorkflowRecord.inbuiltEvent.refresh)
            //     } catch (error) {
            //         console.log(error)
            //     }
            // }, 800);


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

            context.stepControl.hoveredElement = eventDetail
            context.stepControl.hoveredElement.snapshotIndex = lastPictureIndex = context.browserControl.activeSnapshotWorker._queue.length - 1
            context.stepControl.hoveredElement.snapshotPath = context.browserControl.activeSnapshotWorker._queue[context.stepControl.hoveredElement.snapshotIndex]

        }
        return logCurrentElement
    }
    _initFuncDict() {
        return {
            setActiveLocator: this.locatorControl.exposeSetActiveLocator(),
            getActiveSelectors: this.locatorControl.exposeGetActiveSelectors(),
            getDefinedLocator: this.locatorControl.exposeGetDefinedLocator(),
            logCurrentElement: this.exposeLogCurrentElement()
        }
    }

}
module.exports = RecordManager