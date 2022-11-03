import { getXPath } from 'http://localhost:3600/resource/js/getXPath.js';
class HoverElementEntry {
    /**
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.element = element
        this.prevStyle = element.style.backgroundColor
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
    /**
     * 
     * @param {import('./PotentialMatchManager.js').PotentialMatchManager} potentialMatchManager 
     * @param {number} browserIndex
     */
    constructor(potentialMatchManager, browserIndex) {
        this.potentialMatchManager = potentialMatchManager
        this.browserIndex = browserIndex
        this.hoverManager = new HoverElementManager()
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
     * get locator by target element
     * @param {HTMLElement} targetElement 
     */
    _getLocatorByTargetElement(targetElement) {
        try {
            selector = getXPath(targetElement)
        } catch (error) {
        }

        return {
            selector: selector,
            target: targetElement
        }
    }
    /**
     * @param {Event} event 
     */
    handleBrowserAction(event, command) {
        //if the target is whole document, we will redirect it to body because document does not have
        //.getAttribute function. It will cause problem
        let targetElement = event.target
        if (event.target == document) {
            targetElement = document.body
        }
        let timeStamp = Date.now()
        let selector = ''

        let targetElementLocatorResult = this._getLocatorByTargetElement(targetElement)
        let target = targetElementLocatorResult.target
        selector = targetElementLocatorResult.selector

        let targetIFrameLocatorResult = this._getLocatorByTargetElement(window.frameElement)
        let iframe = targetIFrameLocatorResult.selector
        let framePotentialMatch = this.potentialMatchManager.getPotentialMatchByTarget(window.frameElement)
        let potentialMatch = this.potentialMatchManager.getPotentialMatchByTarget(target)

        let currentSelectedIndex = this.potentialMatchManager.getElementSelectorIndex(target)


        let position = getElementPos(target) // this is position in regards to the screen
        let targetInnerText = target.innerText
        let parameter = null

        let 
         = ''
        let targetPicPath = ''
        let fileNames = []
        let isCallBluestoneConsole = false
        switch (command) {
            case EVENTCONST.visibilitychange:
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
            case EVENTCONST.click:
                // console.log(`frame Position: ${JSON.stringify(framePosition)} absolute position: ${JSON.stringify(position)}, clientX,y: ${event.clientX},${event.clientY}`)
                parameter = getRelativeXYCoordination(event)
                break
            case EVENTCONST.mousedown:
                parameter = getRelativeXYCoordination(event)
                break
            case EVENTCONST.mouseup:
                parameter = getRelativeXYCoordination(event)
                break
            case EVENTCONST.change:
                //still use original target because the new target may not have value
                parameter = targetElement.value
                //handle file upload through input
                fileNames = fileUpload(event)
                if (fileNames.length != 0) {
                    command = 'upload'
                    parameter = fileNames
                }
                break;
            case EVENTCONST.keydown:
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
                            // captureHtml('alt+q')
                            command = null
                            parameter = null
                            // window.stopRecording()
                            this.potentialMatchManager.setActiveLocator()
                            // captureScreenshot('alt+q')
                            isCallBluestoneConsole = true
                            console.log('call in-browser spy' + JSON.stringify(position))
                            break
                        }
                        //otherwise, we are not going to record any other operation
                        return
                }
                break;
            case EVENTCONST.scroll:
                parameter = JSON.stringify({
                    y: targetElement.scrollTop,
                    x: targetElement.scrollLeft
                })
                break;
            default:
                break;
        }

        // if (isParentDefinedAndIdentical(event.target, position, potentialMatch)) {
        //     console.log()
        //     let parent = event.target.parentElement

        //     potentialMatch = parent.getAttribute(BLUESTONE.bluestonePotentialMatchIndexes)

        //     selector = finder(parent)
        // }

        let atomicTree = ""
        let atomicTreeStr = ""//atomicTree.stringify()
        if (command != EVENTCONST.scroll && !isCallBluestoneConsole) {
            //will not capture auto-healing information during scroll
            //it will significantly slow down the user experience
            // will collect auto-healing when call bluestone console
            // this will create noticible user experience slow down
            // atomicTree = new AtomicElementTree(target)
            // atomicTreeStr = atomicTree.stringify(atomicTree)
        }
        const eventDetail = {
            command: command,
            iframe: iframe,
            target: selector,
            parameter: parameter,
            targetInnerText: targetInnerText,
            framePotentialMatch: framePotentialMatch,
            targetPicPath: targetPicPath,
            potentialMatch: potentialMatch,
            currentSelectedIndex: currentSelectedIndex,
            pos: {
                x: position.x,
                y: position.y,
                right: position.right,
                buttom: position.buttom,
                height: position.height,
                width: position.width
            },
            timestamp: timeStamp,
            healingTree: atomicTreeStr
        }

        // new CustomEvent('eventDetected', { detail: eventDetail });
        //will only log event from visible behavior except for file upload
        //file upload could trigger another element
        if ((position.height > 0 && position.width > 0) || command == 'upload' || command == null) {
            window.logEvent(eventDetail)
        }

        // console.log(JSON.stringify(event))
    }
    /**
     * 
     * @param {Event} event 
     */
    handleMouseOverEvent(event) {
        let selector = null
        let locatorInfo = this._getLocatorByTargetElement(event.target)
        let target = locatorInfo.target
        selector = locatorInfo.selector
        if (selector == null) return
        const innerText = target.innerText
        let position = {}
        try {
            position = getElementPos(target)
        } catch (error) {
            console.log(error)
        }

        // let atomicTree = new AtomicElementTree(target)
        // let atomicTreeStr = atomicTree.stringify()
        let atomicTree = {}
        let atomicTreeStr = '{}'
        //style change will only be applied to source element
        const previousStyle = event.target.style.backgroundColor
        this.hoverManager.mouseIn(event.target)

        let frameInfo = this._getLocatorByTargetElement(window.frameElement)
        let iFrame = frameInfo.selector
        let framePotentialMatch = this.potentialMatchManager.getPotentialMatchByTarget(window.frameElement)
        let potentialMatch = this.potentialMatchManager.getPotentialMatchByTarget(target)

        let noLocatorFound = 'rgba(255, 0, 145, 0.45)'
        let locatorFound = 'rgba(0, 223, 145, 0.45)'
        //depends on the color schema, display different color to give user a hint for next step

        //if we have set the final locator, mark it as green
        let currentSelectedIndex = this.potentialMatchManager.getElementSelectorIndex(target)

        if (currentSelectedIndex) {
            event.target.style.backgroundColor = locatorFound
            window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, currentSelectedIndex, atomicTreeStr)
            return
        }


        //no match mark as no locator found
        if (potentialMatch.length == 0) {
            event.target.style.backgroundColor = noLocatorFound
            window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, null, atomicTreeStr)
            // setStateToAllEvents(true, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)
            // console.log('no potential match index')
            return
        }


        // console.log(potentialMatch)
        // console.log(potentialMatchArray)
        if (potentialMatch.length == 1) {
            //exact one match, we are good
            event.target.style.backgroundColor = locatorFound
            window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, 0, atomicTreeStr)
            // setStateToAllEvents(false, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)
            // console.log('only 1 potential match index')
            return
        }

        //if toehrwise, 
        // console.log('more than 1 potential matches')
        event.target.style.backgroundColor = noLocatorFound
        window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, null, atomicTreeStr)
        // setStateToAllEvents(true, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)



    }
    /**
     * as mouse move out, cancel the color
     * @param {Event} event 
     */
    handleMouseOutEvent(event) {
        this.hoverManager.mouseOut(event.target)
    }

}
