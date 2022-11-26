import { getXPath } from 'http://localhost:3600/resource/js/getXPath.js';
import { getElementPos } from "http://localhost:3600/resource/js/getElementPosition.js";
import { PotentialMatchManager } from "http://localhost:3600/resource/js/PotentialMatchManager.js";
import { LocatorRecommendationManager } from "http://localhost:3600/resource/js/LocatorRecommendationManager.js";
class HoverElementEntry {
    /**
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.element = element
        this.prevStyle = element.style.backgroundColor
    }
}
class TargetInfo {
    /**
     * This is used to store meta informaton for the target
     * @param {PotentialMatchManager} potentialMatchManager 
     * @param {string} command 
     * @param {HTMLElement} targetElement 
     */
    constructor(potentialMatchManager, command, targetElement) {
        this.potentialMatchManager = potentialMatchManager
        this.command = command
        this.targetElement = targetElement
        this.timeStamp = Date.now()
        this.selector = ''
        this.iframe = ''
        this.framePotentialMatch = []
        this.potentialMatch = []
        this.currentSelectedIndex = null
        this.position = {}
        this.targetInnerText = ''
        this.healingTree = '{}'
        this.parameter = ''
        this.init()

    }
    /**
     * Output parameter into standardized format
     * @param {string} parameter 
     * @returns 
     */
    output(parameter) {
        this.parameter = parameter
        return {
            command: this.command,
            iframe: this.iframe,
            target: this.selector,
            parameter: this.parameter,
            targetInnerText: this.targetInnerText,
            framePotentialMatch: this.framePotentialMatch,
            potentialMatch: this.potentialMatch,
            currentSelectedIndex: this.currentSelectedIndex,
            pos: this.position,
            timestamp: this.timeStamp,
            healingTree: this.healingTree
        }
    }
    init() {
        let targetElement = this.targetElement

        let targetElementLocatorResult = this._getLocatorByTargetElement(targetElement)
        let target = targetElementLocatorResult.target
        this.selector = targetElementLocatorResult.selector

        let targetIFrameLocatorResult = this._getLocatorByTargetElement(window.frameElement)
        this.iframe = targetIFrameLocatorResult.selector
        this.framePotentialMatch = this.potentialMatchManager.getPotentialMatchByTarget(window.frameElement)
        this.potentialMatch = this.potentialMatchManager.getPotentialMatchByTarget(target)

        this.currentSelectedIndex = this.potentialMatchManager.getElementSelectorIndex(target)


        this.position = getElementPos(target) // this is position in regards to the screen
        this.targetInnerText = target.innerText

        let atomicTree = ""
        let atomicTreeStr = ""//atomicTree.stringify()
        if (this.command != 'scroll') {
            //will not capture auto-healing information during scroll
            //it will significantly slow down the user experience
            // will collect auto-healing when call bluestone console
            // this will create noticible user experience slow down
            // atomicTree = new AtomicElementTree(target)
            // atomicTreeStr = atomicTree.stringify(atomicTree)
        }
    }
    /**
     * get locator by target element
     * @param {HTMLElement} targetElement 
     */
    _getLocatorByTargetElement(targetElement) {
        let selector = getXPath(targetElement)
        try {
            let customLocator = window.getLocator(targetElement, selector)
            if (customLocator.selector)
                selector = customLocator.selector
            else if (customLocator.target != targetElement)
                selector = getXPath(targetElement)
            let targetElement = customLocator.target
        } catch (error) {

        }

        return {
            selector: selector,
            target: targetElement
        }
    }
}
class HoverElementManager {
    constructor() {
        /**@type {HoverElementEntry[]} */
        this.entryList = []
    }
    /**
     * when hovered in a element, add its into the list
     * If there is existing element in there, we will just skip
     * because first style is always most reliable
     * If there is no element, we will add that list
     * @param {HTMLElement} element 
     */
    mouseIn(element) {
        let existingEntry = this.entryList.find(item => item.element == element)
        if (existingEntry) return
        let newHoverElementEntry = new HoverElementEntry(element)
        this.entryList.push(newHoverElementEntry)
    }
    /**
     * When mouse out a element, check if there is record in the past
     * if no record, just return
     * if found, set style back and remove element from the list
     * @param {HTMLElement} element 
     * @returns 
     */
    mouseOut(element) {
        let existingEntry = this.entryList.find(item => item.element == element)
        if (existingEntry == null) return
        this.entryList = this.entryList.filter(item => item.element != existingEntry)
        element.style.backgroundColor = existingEntry.prevStyle

    }

}
export class BrowserEventRecorder {

    constructor(EVENTCONST) {
        this.EVENTCONST = EVENTCONST
        /**@type {import('./LocatorRecommendationManager').LocatorRecommendationManager} */
        this.locatorRecommendationManager = new LocatorRecommendationManager([])
        /**@type {import('./PotentialMatchManager').PotentialMatchManager} */
        this.potentialMatchManager = new PotentialMatchManager()
        this.browserIndex = null
        this.hoverManager = new HoverElementManager()
        /**@type {TargetInfo} */
        this.mouseOverTargetInfo = null
        this.robustLocatorPreference = null
    }
    getXPath(element) {
        return getXPath(element)
    }
    setRobustLocatorPreference() { }
    /**
     * set browser index for element
     * @param {number} index 
     */
    setBrowserIndex(index) {
        this.browserIndex = index
    }
    /**
     * based on event inforamtion, calculate relative x y in percentage.
     * @param {Event} event 
     * @returns 
     */
    getRelativeXYCoordination(event) {
        let target = event.target
        let framePosition = target.getBoundingClientRect() //this is position in regards to curent frame
        let relativeMouseX = Math.round(((event.clientX - framePosition.x) / framePosition.width) * 100) / 100
        let relativeMouseY = Math.round((event.clientY - framePosition.y) / framePosition.height * 100) / 100

        //1st realtive x cannot be less than 0
        //2nd somehow, escodegen does not support negative number output
        if (relativeMouseX < 0 || relativeMouseX > 1) {
            relativeMouseX = 0.5
        }
        if (relativeMouseY < 0 || relativeMouseY > 1) {
            relativeMouseY = 0.5
        }
        let jsonStr = JSON.stringify({
            x: relativeMouseX,
            y: relativeMouseY
        })
        return jsonStr

    }

    /**
     * @param {Event} event 
     */
    async handleBrowserAction(event, command) {
        //if the target is whole document, we will redirect it to body because document does not have
        //.getAttribute function. It will cause problem
        let targetElement = event.target
        if (event.target == document) {
            targetElement = document.body
        }
        let targetInfo = new TargetInfo(this.potentialMatchManager, command, targetElement)
        let parameter = null

        let fileNames = []

        switch (command) {
            case this.EVENTCONST.visibilitychange:
                if (document.visibilityState == 'hidden') return
                //in edit mode, we saw an situation where a swap tab operation is added at the end
                // we will normally land in about:blank page when we are coming from edit mode
                //As we switch to page, it will triger an go to tab action
                //in this case, we will not record any switch page action from about:blank
                //to avoid adding unnecessary steps toward the end of the script
                if (window.location.href == 'about:blank') return
                parameter = JSON.stringify({
                    tabIndex: this.browserIndex
                })
                command = 'switchTab'
                break
            case this.EVENTCONST.click:
                // console.log(`frame Position: ${JSON.stringify(framePosition)} absolute position: ${JSON.stringify(position)}, clientX,y: ${event.clientX},${event.clientY}`)
                parameter = this.getRelativeXYCoordination(event)
                break
            case this.EVENTCONST.mousedown:
                parameter = this.getRelativeXYCoordination(event)
                break
            case this.EVENTCONST.mouseup:
                parameter = this.getRelativeXYCoordination(event)
                break
            case this.EVENTCONST.change:
                //still use original target because the new target may not have value
                parameter = targetElement.value
                //handle file upload through input
                fileNames = fileUpload(event)
                if (fileNames.length != 0) {
                    command = 'upload'
                    parameter = fileNames
                }
                break;
            case this.EVENTCONST.keydown:
                //currently, we only support enter and esc key
                parameter = event.code
                switch (parameter) {
                    case 'Enter':
                        break;
                    case 'Escape':
                        break;
                    case 'Tab':
                        break;
                    default:
                        //if we see combo key ctrl-q, we will call in-browser plugin
                        if ((event.ctrlKey || event.altKey) && event.key === 'q') {
                            await window.takePictureSnapshot()
                            command = null
                            parameter = null
                            // window.stopRecording()
                            this.potentialMatchManager.setActiveLocator()
                            // captureScreenshot('alt+q')
                            console.log('call in-browser spy' + JSON.stringify(targetInfo.position))
                            break
                        }
                        //otherwise, we are not going to record any other operation
                        return
                }
                break;
            case this.EVENTCONST.scroll:
                parameter = JSON.stringify({
                    y: targetElement.scrollTop,
                    x: targetElement.scrollLeft
                })
                break;
            default:
                break;
        }


        let eventDetail = targetInfo.output(parameter)

        // new CustomEvent('eventDetected', { detail: eventDetail });
        //will only log event from visible behavior except for file upload
        //file upload could trigger another element
        if ((targetInfo.position.height > 0 && targetInfo.position.width > 0) || command == 'upload' || command == null) {
            window.logEvent(eventDetail)
        }
        console.log(targetInfo)
        if (command == null) {
            this.locatorRecommendationManager.getLocatorBackup(event.target)
        }
        // console.log(JSON.stringify(event))
    }
    /**
     * 
     * @param {Event} event 
     */
    handleMouseOverEvent(event) {
        let targetElement = event.target
        if (targetElement == document) {
            targetElement = document.body
        }
        let targetInfo = new TargetInfo(this.potentialMatchManager, 'mouseover', targetElement)
        this.mouseOverTargetInfo = targetInfo
        this.hoverManager.mouseIn(event.target)

        let noLocatorFound = 'rgba(255, 0, 145, 0.45)'
        let locatorFound = 'rgba(0, 223, 145, 0.45)'
        //depends on the color schema, display different color to give user a hint for next step

        //if we have set the final locator, mark it as green
        let currentSelectedIndex = targetInfo.currentSelectedIndex

        if (currentSelectedIndex) {
            event.target.style.backgroundColor = locatorFound
            window.logCurrentElement(targetInfo.output())
            return
        }


        //no match mark as no locator found
        if (targetInfo.potentialMatch.length == 0) {
            event.target.style.backgroundColor = noLocatorFound
            window.logCurrentElement(targetInfo.output())
            // console.log('no potential match index')
            return
        }



        if (targetInfo.potentialMatch.length == 1) {
            //exact one match, we are good
            event.target.style.backgroundColor = locatorFound
            window.logCurrentElement(targetInfo.output())
            return
        }

        //not found        
        event.target.style.backgroundColor = noLocatorFound
        window.logCurrentElement(targetInfo.output())




    }
    /**
     * as mouse move out, cancel the color
     * @param {Event} event 
     */
    handleMouseOutEvent(event) {
        this.hoverManager.mouseOut(event.target)
    }

}
