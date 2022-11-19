const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { waitTillScreenshotEqualToCount, waitTillSnapshotQueueCleared } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Resource Manager - logEvent- Switch Context', () => {
    let recordwrightBackend = new RecordWrightBackend()
    let locatorPath = path.join(__dirname, './files/locator.js')

    let recordManager = new RecordManager({ locatorPath: locatorPath })
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

    it('should record browser context index in event recorder correctly', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.createBrowserContext({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        let contexts = recordManager.browserControl.browser.contexts()
        for (let i = 0; i < contexts.length; i++) {
            let browserIndex = await contexts[i].pages()[0].evaluate(() => {
                /**@type {import('../../../controller/browser-control/browser-script/event-recorder').BrowserEventRecorder} */
                let eventRecorder = window.eventRecorder
                return eventRecorder.browserIndex
            })
            assert.equal(browserIndex, i)
        }
    }).timeout(10000)
    it('should not record additional step if we stay in the same page').timeout(10000)
})