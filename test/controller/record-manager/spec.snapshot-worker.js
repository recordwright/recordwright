const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
const { resolve } = require('path')
describe('Resource Manager - Snapshot Worker', () => {
    let recordwrightBackend = new RecordWrightBackend()
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    after(async function () {
        await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    /**
     * 
     * @param {RecordManager} recordManager 
     * @returns 
     */
    let waitTillQueueCleared = async function (recordManager) {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 100))
            let queueLength = recordManager.browserControl.activeSnapshotWorker._picQueue.length
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
            let screenshotCount = recordManager.browserControl.activeSnapshotWorker.pictureRecords.length
            if (screenshotCount == count)
                break
        }
        return
    }
    it('should take screenshot by the time page is loaded', async () => {
        let recordManager = new RecordManager({})
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        waitTillScreenshotEqualToCount(recordManager, 1)
    }).timeout(5000)
    it('it should queue multiple screenshot correctly', async () => {
        let recordManager = new RecordManager({})
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.activePage.evaluate(async item => {
            for (let i = 0; i < 50; i++) {
                window.takePictureSnapshot()
            }
        })
        await waitTillQueueCleared(recordManager)
        assert.notEqual(recordManager.browserControl.activeSnapshotWorker.pictureRecords.length, 50)

    }).timeout(5000)
    it('should take screenshot in case the page is changed')

})