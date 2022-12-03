const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { waitTillScreenshotEqualToCount, waitTillSnapshotQueueCleared } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Record Manager - logEvent- Switch Context', () => {
    let recordwrightBackend = new RecordWrightBackend()
    let locatorPath = path.join(__dirname, './files/locator.js')

    let recordManager = new RecordManager({ locatorPath: locatorPath })
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    beforeEach(async function () {
        recordManager.stepControl.steps = []
        recordManager.stepControl._rawStepRepo = []
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
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.createBrowserContext({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let contexts = recordManager.browserControl.browser.contexts()
        for (let i = 0; i < contexts.length; i++) {
            let browserIndex = await contexts[i].pages()[0].evaluate(() => {
                /**@type {import('../../../controller/browser-control/browser-script/event-recorder').BrowserEventRecorder} */
                let eventRecorder = window.eventRecorder
                return eventRecorder.browserIndex
            })
            assert.equal(browserIndex, i, 'the browser index should match designated value')
            await contexts[i].pages()[0].locator(Locator.input.locator).click()
            await contexts[i].pages()[0].locator(Locator.input.locator).click()
        }
        await new Promise(resolve => setTimeout(resolve, 50))
        assert.deepEqual(recordManager.stepControl.steps.length, 14, 'we expect to see 6 steps. 4 clicks+2 switch context +4 waitForElement+2 goto frame + 2 wait for frame. bringPageToFront should only be added once')
        let bringPageToFrontSteps = recordManager.stepControl.steps.filter(item => item.command == 'bringPageToFront')
        assert.deepEqual(bringPageToFrontSteps.length, 2, '2 bring page to front context exists because we launch 2 browsers')
        for (let i = 0; i < bringPageToFrontSteps.length; i++) {
            let step = bringPageToFrontSteps[i]
            assert.deepEqual(step.parameter[1].value, i, 'the context index should be set accordingly')
        }

    }).timeout(1000000)
})