const ElementSelector = require('../class/ElementSelector')
const HealingSnapshot = require('../class/HealingSnapshot')
const { Frame, ElementHandle } = require('playwright')
const assert = require('assert')
class Options {
    constructor() {
        /** @type {boolean} if no element is found, should we throw error?*/
        this.throwError = false
        this.takeSnapshot = true
        this.isHealingByLocatorBackup = true
    }


}
module.exports = findElement
/**
 * Find a element within timeout period. If no element is found, a error will be thrown
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {Options} option 
 * @param {number} timeout wait time in ms
 * @param {HealingSnapshot} healingSnapshot locator snapshot for auto-healing. File under .\snapshot\
 * @returns {ElementHandle}
 */
async function findElement(frame, elementSelector, healingSnapshot) {
    let element = frame.locator(elementSelector.locator)
    let resultLength = await element.count()
    let result = null
    if (resultLength == 1) {
        result = element
    }
    return result

}
class ElementInfo {
    constructor(element, locator) {
        this.element = element
        this.locator = locator
        this.count = 0
    }
    addCount() {
        this.count += 1
    }
}
/**
 * Check if element is covered by anything
 * @param {ElementHandle} element 
 */
async function isElementBlocked(element) {
    let result = await element.evaluate(element => {
        function isVisible(elem) {
            if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
            const style = getComputedStyle(elem);
            if (style.display === 'none') return false;
            if (style.visibility !== 'visible') return false;
            if (style.opacity < 0.1) return false;
            if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
                elem.getBoundingClientRect().width === 0) {
                return false;
            }
            let elemBoundingRect = elem.getBoundingClientRect()
            if (elemBoundingRect.width == 0) return false
            if (elemBoundingRect.height == 0) return false
            let offsetWidth = elem.offsetWidth
            let offsetHeight = elem.offsetHeight
            if (elem.offsetWidth == null) {
                offsetWidth = elemBoundingRect.width
            }
            if (elem.offsetHeight == null) {
                offsetHeight = elemBoundingRect.height
            }
            const elemCenter = {
                x: elemBoundingRect.left + offsetWidth / 2,
                y: elemBoundingRect.top + offsetHeight / 2
            };

            if (elemCenter.x < 0) return false;
            if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
            if (elemCenter.y < 0) return false;
            if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
            let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
            do {
                if (pointContainer === elem) return true;
                try {
                    pointContainer = pointContainer.parentNode
                }
                catch (err) {
                    break
                }

            } while (pointContainer);
            return false;
        }

        function getZIndex(element) {

            let zIndex = 0

            while (true) {
                let zIndexStr = window.getComputedStyle(element).zIndex
                if (zIndexStr != 'auto') {
                    let currentZIndex = Number.parseInt(zIndexStr)
                    if (currentZIndex > zIndex)
                        zIndex = currentZIndex
                }

                element = element.parentElement
                if (element == null) break
            }

            return zIndex
        }
        function isSourceCoveredByTarget(sourceRect, targetRect) {
            let xCenter = (sourceRect.x + sourceRect.width / 2)
            let yCenter = (sourceRect.y + sourceRect.height / 2)

            let targetXMost = targetRect.x + targetRect.width
            let targetYMost = targetRect.y + targetRect.height

            return (xCenter > targetRect.x) && (xCenter < targetXMost) && (yCenter > targetRect.y) && (yCenter < targetYMost)
        }

        function isSourceCoveredByAnyElement(sourceElement) {
            let allElemenets = [...document.getElementsByTagName('*')]
            let sourceRect = sourceElement.getBoundingClientRect()
            let sourceZIndex = getZIndex(sourceElement)

            let coveredElement = allElemenets.find(item => {
                if (item == sourceElement) return false
                if (!isVisible(item)) return false
                let itemRect = item.getBoundingClientRect()

                if (!isSourceCoveredByTarget(sourceRect, itemRect)) return false
                let itemZIndex = getZIndex(item)
                return itemZIndex > sourceZIndex

            })
            return coveredElement

        }
        return isSourceCoveredByAnyElement(element) != null
    }, element)
    return result
}
/**
 * Based on locator, return element handle
 * @param {Page} page
 * @param {string} locator 
 * @returns {ElementHandle}
 */
async function getElementByLocator(page, locator) {
    let element = null
    if (locator.startsWith('/') || locator.startsWith('(')) {
        //xpath
        let elementResult = await page.$x(locator)
        if (elementResult.length > 0) element = elementResult[0]
    }
    else {
        //selector
        element = await page.$(locator)
    }
    return element
}
/**
 * Use backup locator to find out element whose similarity score is highest
*  @param {Page} page 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} similarityBenchmark
 * @returns {ElementInfo}
 */
async function getElementBasedOnLocatorBackup(page, elementSelector, similarityBenchmark) {
    /**@type {Object.<string,ElementInfo>} */
    let elementDict = {}
    let sum = 0
    /**@type {string} */
    let bestCandidate = null
    let bestElement = new ElementInfo(null, '')
    if (elementSelector.snapshot == null) {
        return bestElement
    }
    //get existing elements
    let potentialMatchList = await page.evaluate((locators => {
        console.log(locators)
        function getElementByXpath(xpath, source = document) {
            let result = []
            let elements = document.evaluate(xpath, source)
            while (true) {
                let node = elements.iterateNext()
                if (node == null) break
                result.push(node)
            }
            return result

        }

        class ElementInfo {
            constructor(element, locator) {
                this.element = element
                this.locator = locator
                this.count = 1
            }
            addCount() {
                this.count += 1
            }
        }
        class ElementInfoList {
            constructor() {
                this.result = []
            }
            addCount(element, xpath) {
                let entry = this.result.find(item => item.element == element)
                if (entry == null) {
                    //element not defined, create a new one
                    entry = new ElementInfo(element, xpath)
                    this.result.push(entry)
                }
                else {
                    entry.addCount()
                }
            }

        }

        function getBestMatch(potentialLocatorList) {
            let scoreBoard = new ElementInfoList()
            for (let locator of potentialLocatorList) {
                let locatorResults = null
                try {
                    locatorResults = getElementByXpath(locator)
                } catch (error) {
                    console.log(error)
                    continue
                }


                //skip invalid locators
                if (locatorResults.length == 0 || locatorResults.length > 1) {
                    continue
                }

                let element = locatorResults[0]
                scoreBoard.addCount(element, locator)

            }

            return scoreBoard
        }
        return getBestMatch(locators)
    }), elementSelector.snapshot)
    if (potentialMatchList == null || potentialMatchList.result == null) {
        return bestElement
    }

    //get most possible locator and its score
    for (let match of potentialMatchList.result) {
        sum += match.count
        //if best candidate is not defined, use current element
        if (bestCandidate == null) {
            bestCandidate = match
        }
        else if (bestCandidate.count < match.count) {
            //if best canddidate is defined yet it is not as good as what we have, use what we have
            bestCandidate = match
        }
    }


    //get score for possible locator
    if (bestCandidate == null) {
        return { element: null }
    }
    let currentSimilarity = bestCandidate.count / sum
    if (currentSimilarity > similarityBenchmark) {
        let elements = await page.$x(bestCandidate.locator)
        bestElement = new ElementInfo(elements[0], bestCandidate.locator)
    }

    return bestElement
}
/**
 * 
 * @param {Page} page 
 * @param {ElementHandle} element 
 * @returns {SnapshotData}
 */
async function highlightProposedElement(page, element) {
    let borderStyle = ''
    if (element != null) {
        borderStyle = await element.evaluate(node => {
            //record previous border info
            let borderStyle = node.style.border
            //draw rectangle
            node.style.border = "thick solid #0000FF"
            return borderStyle
        })
    }
    if (page.constructor.name != 'CDPPage' && page.constructor.name != 'Page') {
        try {
            page = page.page()
        } catch (error) {
            page = page._frameManager.page()
        }
    }
    let pngData = await page.screenshot({ type: 'png' })

    let session = await page.target().createCDPSession();
    await session.send('Page.enable');
    let sessionResult = await session.send('Page.captureSnapshot');


    if (element != null) {
        await element.evaluate((node, prevBorderStyle) => {
            node.style.border = prevBorderStyle
        }, borderStyle)
    }
    let snapshotData = new SnapshotData(pngData, sessionResult.data)
    return snapshotData

}