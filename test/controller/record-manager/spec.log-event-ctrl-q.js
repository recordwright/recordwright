const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { waitForGetRecommendedLocator, callInBrowserSpy } = require('./support')
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
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserControl.activePage.locator(Locator['input'].locator)
        await callInBrowserSpy(btnGetStarted)
        let recommendedLocatorCount = await waitForGetRecommendedLocator(recordManager)
        assert.notEqual(recommendedLocatorCount, 0, 'recommended locator should not be equal 0')

    }).timeout(100000)
})