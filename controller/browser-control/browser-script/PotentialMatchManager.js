import { getElementByXpath } from 'http://localhost:3600/resource/js/getXPath.js';
class LocatorEntry {
    /**
     * 
     * @param {HTMLElement} target 
     */
    constructor(target) {
        /**@type {number[]} */
        this.potentialMatch = []
        /** @type {HTMLElement} */
        this.target = target

        let rect = target.getBoundingClientRect()
        this.x = rect.x
        this.y = rect.y
        this.width = rect.width
        this.height = rect.height
        this.midX = rect.x + rect.width / 2
        this.midY = rect.y + rect.height / 2
    }
    /**
     * update potential match inforamtion
     * @param {number} matchIndex 
     */
    updatePotentialMatch(matchIndex) {
        let uniqueSet = new Set([...this.potentialMatch, matchIndex])
        this.potentialMatch = [...uniqueSet]
    }
}
class ElementCoordinationManager {
    constructor() {
        /**@type {Object.<string,HTMLElement[]>} */
        this.dict = {}
        this.initialize()
    }
    initialize() {
        let elements = Array.from(document.getElementsByTagName('*'))
        for (let element of elements) {
            let pos = element.getBoundingClientRect()
            let midX = Math.round(pos.x + pos.width / 2)
            let midY = Math.round(pos.y + pos.height / 2)
            //ignore elements that is not visible
            if (midX <= 0 && midY <= 0) {
                continue
            }
            if (pos.width == 0 && pos.height == 0) {
                continue
            }


            let key = this.getKey(midX, midY)
            if (this.dict[key] == null) {
                this.dict[key] = []
            }

            this.dict[key].push(element)
        }
    }
    getKey(midX, midY) {
        return `${midX},${midY}`
    }
    /**
     * 
     * @param {LocatorEntry} entry 
     * @returns {HTMLElement[]}
     */
    getOverlapsedElementsToLocatorEntry(entry) {
        let result = []
        let pos = entry.target.getBoundingClientRect()
        let midX = Math.round(pos.x + pos.width / 2)
        let midY = Math.round(pos.y + pos.height / 2)
        let key = this.getKey(midX, midY)
        if (this.dict[key] == null) {
            result = []
        }
        else {
            result = this.dict[key]
        }
        return result
    }
}
export class PotentialMatchManager {
    constructor() {
        /** @type {LocatorEntry[]} */
        this.currentPotentialMatchList = []
        /** @type {LocatorEntry[]} */
        this.proposedPotentialMatchList = []
        /** @type {LocatorEntry[]} */
        this.selectedMatches = []
        this.scanLocatorQueue = []
        this.lastLocatorScanTime = Date.now()
        this.bluestoneRegisteredLocator = []
        this.waitTime = 1000
        /**
         * This is used to aggregate all potential match from multiple frames
         * This is served as a single source of the truth
         * For elements in the main frame, it will aggregate all locator potential match information from subframes 
         * For those eventRecorder in the child frame, it will be empty
         * @type {Object.<string,LocatorEntry[]>} 
         * */
        this.masterPotentialMatch = {}
    }

    /**
     * @param {LocatorEntry[]} sourceList
     * @param {HTMLElement} target 
     */
    getElement(sourceList, target) {
        return sourceList.find(item => item.target == target)
    }
    /**
     * Based on target element, return locator entry. If there is no potential match, returns empty string
     * @param {HTMLElement} target 
     * @returns {number[]}
     */
    getPotentialMatchByTarget(target) {
        if (target == null) return []
        let locatorEntry = this.getElement(this.currentPotentialMatchList, target)
        if (locatorEntry == null) return []
        return locatorEntry.potentialMatch
    }
    async updateBluestoneRegisteredLocator() {
        this.bluestoneRegisteredLocator = await window.getDefinedLocator()
    }
    /**
     * update potential match information to the target
     * if no match if found, create element
     * @param {HTMLElement} target 
     * @param {number} index 
     * @returns {number[]} list of index of matched locator
     */
    addPotentialMatchToTarget(target, index) {
        if (target == document) return
        let locatorEntry = this.getElement(this.proposedPotentialMatchList, target)


        if (locatorEntry == null) {
            locatorEntry = new LocatorEntry(target)
            this.proposedPotentialMatchList.push(locatorEntry)
        }
        locatorEntry.updatePotentialMatch(index)

        return locatorEntry

    }
    /**
     * Define elements based on the position check
     * If an undefined element's mid point is equivalent of a defined element's mid point
     * Mark undefined element's locator to be the same as defined element
     * Do this because some tims, there can be two layers in same location
     * One layer is stable but it is on the bottom, user will interact with top element whose locator
     * is unstable. This method can help average user to interact with specific location without worrying
     * about how to define elements on the front
     * 
     * Will only perform this feature on undefined element beause I am afriad if two layers of elements
     * both have been defined, adding additional layer of elements could cause confusion, as user try
     * to interact with 1st layer, 2nd layer come up and 2nd layer may not have the feature we want
     * @param {ElementCoordinationManager} coordinationMgr 
     * @param {LocatorEntry} locatorEntry
     */
    async defineElementBasedOnPosition(coordinationMgr, locatorEntry) {
        let elements = coordinationMgr.getOverlapsedElementsToLocatorEntry(locatorEntry)
        for (const ele of elements) {
            let proposedElement = this.getElement(this.proposedPotentialMatchList, ele)
            //current element has been defined already
            if (proposedElement != null)
                continue
            //skip elemnt that cannot pass mid point test
            locatorEntry.potentialMatch.forEach(index => {
                this.addPotentialMatchToTarget(ele, index)
            })

        }
    }
    /**
     * Scan Through all locators in the web page and mark potential match element to its index
     * At a given point of time, there will be 1 instance of scanLocator function running.
     * If there is 0 instance in the queue, then start function and add element to the queue, 
     * If there are 1 instance in the queue, quit current loop and push task into queue
     * If there are 2 instance in the queue alreayd, quit current function
     * we will pop the task toward the end. 
     * After poping queue, if there are still task remains, run it right away.
     * isMainThread switch is used to ensure the main thread will be executed regardless the # of elements in queue
     * in case there are 2 tasks in queue, without this switch, the scan locator will be stuck and never
     * get the chance to execute the subsequent tasks to clear the queue. As a result, the scan locator function
     * will fail
     * @param {boolean} isMainThread if it is main thread, we will execute regardless number of task in queue
     * @returns 
     */
    async scanLocator(isMainThread = false) {


        if (this.scanLocatorQueue.length >= 2 && isMainThread == false) {
            return
        }
        if (this.scanLocatorQueue.length == 1 && isMainThread == false) {
            this.scanLocatorQueue.push('')
            return
        }
        if (this.scanLocatorQueue.length == 0) {
            this.scanLocatorQueue.push('')
        }
        let currentTimeStamp = Date.now()
        if ((currentTimeStamp - this.lastLocatorScanTime) < this.waitTime) {
            await new Promise(resolve => setTimeout(resolve, this.waitTime))
        }

        /** @type {Array<import('../../locator/index').Locator>} */
        let startTime = Date.now()

        let currentLocatorList = this.bluestoneRegisteredLocator
        let getLocatorTime = Date.now()
        //add potential match to elments who's region contains other element's mid point.
        //We do this because we might use other element to identify current element
        let coordinationManager = new ElementCoordinationManager()
        //clean up all 
        let scanLocatorStartTime = Date.now()
        for (let i = 0; i < currentLocatorList.length; i++) {
            currentLocatorList[i].selector = ''
            let locator = currentLocatorList[i]
            let currentLocator = locator.Locator
            let currentElement = null
            try {
                let currentElementList = this.getElementsByLocator(currentLocator)
                //if current locator find element, break current loop to save time
                if (currentElementList.length == 1) {
                    currentElement = currentElementList[0]
                }
            } catch (error) {
                console.log(`Issue on locator at index:${i},locator:${currentLocator}`)
                console.log(error)
            }

            if (currentElement != null) {
                //UI elemnet found, update its attribute
                let locatorEntry = this.addPotentialMatchToTarget(currentElement, i)
                await this.defineElementBasedOnPosition(coordinationManager, locatorEntry)
            }

        }
        let scanLocatorCompleteTime = Date.now()

        this.applyChange()
        let applyChangeCompleteTime = Date.now()
        this.scanLocatorQueue.pop()
        this.lastLocatorScanTime = Date.now()
        // console.log(`
        //     get locator:${getLocatorTime - startTime}
        //     scan locator:${scanLocatorStartTime - scanLocatorCompleteTime},
        //     apply change: ${applyChangeCompleteTime - scanLocatorCompleteTime}
        //     total locator length: ${currentLocatorList.length},
        //     scanLocatorTaskQeueu: ${this.scanLocatorQueue.length},
        //     proposed potential match list: ${this.currentPotentialMatchList.length}
        //     isMainThread: ${isMainThread}
        // `)
        // console.log(this.currentPotentialMatchList)
        this.waitTime = scanLocatorCompleteTime - scanLocatorStartTime
        if (this.scanLocatorQueue.length > 0) {
            this.scanLocator(true)

        }

    }
    /**
     * Update currentPotential Match List. In addition to that, save frame-specific locator inforamtion in the main frame as single source of the truth
     */
    applyChange() {


        //update potential match list and reset proposed list
        this.currentPotentialMatchList = this.proposedPotentialMatchList
        this.proposedPotentialMatchList = []


        //if we are at main frame already, then we just need to updat ourself
        let frameIndex = 'root'
        let currentFrame = window.frameElement
        if (currentFrame == null) {
            this.masterPotentialMatch[frameIndex] = this.currentPotentialMatchList
            return
        }

        // we are at parent frame. we will figure out our frameIndex and update information to the main frame
        //current version assume that we are not going to have nested frame
        let iFrameList = [...window.top.document.getElementsByTagName('iFrame')] //get all iframes in the main frame
        frameIndex = iFrameList.findIndex(item => item == currentFrame)
        /**
         * @type {import('./event-recorder').BrowserEventRecorder}
         */
        let rootEventRecorder = window.top.eventRecorder
        rootEventRecorder.potentialMatchManager.masterPotentialMatch[frameIndex] = this.currentPotentialMatchList


    }
    //based on the locator scan result, report active locators back the recordwright locator manager
    setActiveLocator() {
        let activeLocatorIndexes = []
        /**@type {import('./event-recorder').BrowserEventRecorder} */
        let currentEventRecorder = window.eventRecorder
        if (window.frameElement != null) {
            currentEventRecorder = window.top.eventRecorder
        }

        let framekeys = Object.keys(currentEventRecorder.potentialMatchManager.masterPotentialMatch)
        for (let key of framekeys) {
            currentEventRecorder.potentialMatchManager.masterPotentialMatch[key].forEach(item => {
                activeLocatorIndexes = activeLocatorIndexes.concat(item.potentialMatch)
            })
        }
        window.setActiveLocator(activeLocatorIndexes)

    }
    /**
     * For element has multiple matches, set target match index
     * @param {string} currentLocator 
     * @param {number} index 
     * @returns 
     */
    setElementSelectorIndex(currentLocator, index) {
        let currentElementList = []
        currentElementList = this.getElementsByLocator(currentLocator)
        //stop mark element operation if locator element did not match
        if (currentElementList.length != 1) return

        let currentElement = currentElementList[0]
        this.selectedMatches = this.selectedMatches.filter(item => { item.target != currentElement })
        let locatorEntry = new LocatorEntry(currentElement)
        locatorEntry.updatePotentialMatch(index)

        this.selectedMatches = this.selectedMatches.filter(item => item.target != currentElement)

        this.selectedMatches.push(locatorEntry)
    }
    /**
     * Check if element is selected
     * @param {HTMLElement} element 
     * @returns 
     */
    getElementSelectorIndex(element) {
        let target = this.selectedMatches.find(item => item.target == element)
        if (target == null) return null
        return target.potentialMatch[0]
    }
    getElementsByLocator(currentLocator) {
        let currentElementList = []
        try {
            if (currentLocator.startsWith('/') || currentLocator.startsWith('(')) {
                //current locator is xpath
                currentElementList = getElementByXpath(currentLocator)
            }
            else {
                //current selector is css selector
                currentElementList = document.querySelectorAll(currentLocator)
            }
        } catch (error) {
            console.log('Invalid Locator: ' + currentLocator)
        }

        return currentElementList

    }
}