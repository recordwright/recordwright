const { Locator, Page } = require('playwright')
const RecordManager = require('../../../controller/record-manager/index')
/**
 * 
 * @param {RecordManager} recordManager 
 * @returns 
 */
let waitTillSnapshotQueueCleared = async function (recordManager) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100))
        let queueLength = recordManager.browserControl.activeSnapshotWorker._queue.length
        if (queueLength == 0)
            break
    }
    return
}
/**
* 
* @param {RecordManager} recordManager 
* @param {number} count
* @returns 
*/
let waitTillScreenshotEqualToCount = async function (recordManager, count) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100))
        let screenshotCount = recordManager.browserControl.activeSnapshotWorker.records.length
        if (screenshotCount == count)
            break
    }
    return
}
/**
 * 
 * @param {Locator} locatorElement 
 */
let callInBrowserSpy = async function (locatorElement) {
    await locatorElement.hover()
    await new Promise(resolve => setTimeout(resolve, 50))
    await locatorElement.evaluate(target => {
        let event = new Event('keydown');
        Object.defineProperty(event, "ctrlKey", {
            writable: false,
            value: true,
        });

        Object.defineProperty(event, "key", {
            writable: false,
            value: 'q',
        });

        Object.defineProperty(event, "target", {
            writable: false,
            value: target,
        });
        document.dispatchEvent(event);

    })
    await new Promise(resolve => setTimeout(resolve, 50))
}
/**
* 
* @param {RecordManager} recordManager 
* @returns {number}
*/
let waitForGetRecommendedLocator = async function (recordManager) {
    let startTime = Date.now()
    let timeoutMs = 5000
    let elapsedTime = 0
    while (elapsedTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 100))
        let recommendedLocatorCount = recordManager.stepControl.hoveredElement.recommendedLocators.length
        if (recommendedLocatorCount > 0) {
            return true
        }
        elapsedTime = Date.now() - startTime
    }
    return 0
}
/**
 * @param {Object} input
 * @param {Page} input.page 
 * @param {string} input.url
 * @param {string } input.iframeId
 */
let injectIframe = async function ({ page, url = 'https://todomvc.com/examples/angularjs/#/', iframeId = 'rw-iframe' } = {}) {
    let inputInfo = { url, iframeId }
    await page.evaluate((input) => {
        let finderScript = document.createElement("iframe");
        finderScript.setAttribute('src', input.url)
        finderScript.setAttribute('id', input.iframeId)
        document.body.appendChild(finderScript);
    }, inputInfo)
}
module.exports = {
    injectIframe,
    waitTillSnapshotQueueCleared,
    waitTillScreenshotEqualToCount,
    callInBrowserSpy,
    waitForGetRecommendedLocator
}