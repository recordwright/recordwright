const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
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
    it('it should take 1 screenshot correctly', async () => {
        let recordManager = new RecordManager({})
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.activePage.evaluate(async item => {
            for (let i = 0; i < 1; i++) {
                await window.takePictureSnapshot()
            }
        })
        await waitTillQueueCleared(recordManager)
        assert.equal(recordManager.browserControl.activeSnapshotWorker.pictureRecords.length, 1)

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
})