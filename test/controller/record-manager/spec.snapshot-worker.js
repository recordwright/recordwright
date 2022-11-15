const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
const fs = require('fs')
const { waitTillSnapshotQueueCleared, waitTillScreenshotEqualToCount } = require('./support')
describe('Resource Manager - Snapshot Worker', () => {
    let recordwrightBackend = new RecordWrightBackend()
    let recordManager = new RecordManager({})
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    afterEach(async function () {
        await recordManager.browserControl.closeAllInstances()
        this.timeout(60000)
    })
    after(async function () {
        if (recordManager.browserControl)
            await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('should take screenshot by the time page is loaded', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await waitTillScreenshotEqualToCount(recordManager, 1)
        if (!recordManager.browserControl.activeSnapshotWorker.records[0].path.includes('.jpeg')) {
            assert.fail('Output file is not a picture')
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        try {
            fs.accessSync(recordManager.browserControl.activeSnapshotWorker.records[0].path)
        } catch (error) {
            assert.fail('Unable to create screenshot correctly in the disk')
        }

    }).timeout(10000)
    it('it should queue multiple screenshot correctly', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.activePage.evaluate(async item => {
            for (let i = 0; i < 50; i++) {
                window.takePictureSnapshot('hello world')
            }
        })
        await waitTillSnapshotQueueCleared(recordManager)
        assert.notEqual(recordManager.browserControl.activeSnapshotWorker.records.length, 50)

    }).timeout(10000000)
    it('should take screenshot in case the page is changed', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await waitTillScreenshotEqualToCount(recordManager, 1)
        await recordManager.browserControl._activePage.evaluate(item => {
            let ele = document.querySelector('h1')
            ele.innerText = 'sb'
        })
        await waitTillSnapshotQueueCleared(recordManager)
        await waitTillScreenshotEqualToCount(recordManager, 2)

    }).timeout(10000)
    it('should take html snapshot by the time page is loaded', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await waitTillScreenshotEqualToCount(recordManager, 1)
        recordManager.browserControl.activeSnapshotWorker.isTakeSnapshot = true
        await recordManager.browserControl.activePage.evaluate(async item => {
            window.takePictureSnapshot('hello world')
        })
        await waitTillScreenshotEqualToCount(recordManager, 2)
        if (!recordManager.browserControl.activeSnapshotWorker.records[1].path.includes('.mhtml')) {
            assert.fail('Output file is not a snapshot')
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        try {
            fs.accessSync(recordManager.browserControl.activeSnapshotWorker.records[1].path)
        } catch (error) {
            assert.fail('Unable to create html snapshot correctly in the disk')
        }

    }).timeout(10000)
})