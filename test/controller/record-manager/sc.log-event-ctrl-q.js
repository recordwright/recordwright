const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { waitTillScreenshotEqualToCount, waitTillSnapshotQueueCleared } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Resource Manager - logEvent - getRecommendedLocator', () => {
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
    it('should create recommended locator for specific element on ctrl+q action', async () => {
        await recordManager.start({ headless: false })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserControl.activePage.locator(Locator['input'].locator)
        await btnGetStarted.hover()
        await new Promise(resolve => setTimeout(resolve, 50))
        await recordManager.browserControl.activePage.keyboard.press('Control+Q')
        await new Promise(resolve => setTimeout(resolve, 1000000))
        recordManager.stepControl.hoveredElement.recommendedLocators
    }).timeout(1000000)
})