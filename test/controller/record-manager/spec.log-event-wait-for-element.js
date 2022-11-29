const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { waitTillScreenshotEqualToCount, waitTillSnapshotQueueCleared } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Resource Manager - logEvent- waitForElement', () => {
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

    it('should add wait for element against step that has ElementSelector automatically', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.activePage.locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 50))
        assert.deepEqual(recordManager.stepControl.steps.length, 3, 'we expect to see 3 steps. 1 go to context, 1 wait for element, 1 click')
        assert.deepEqual(recordManager.stepControl.steps[1].command, 'waitforElement', 'the waitforElement should be added')
        assert.deepEqual(recordManager.stepControl.steps[1].parameter[2].value > 0, true, 'the timeout should be populated')

    }).timeout(1000000)
    it('should not add wait step against element that does not have element selector')
    it('should set timeout to 3000ms in case the wait time is less than 50ms')
})