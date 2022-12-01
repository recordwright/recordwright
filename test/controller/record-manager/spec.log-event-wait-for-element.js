const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const RecordingStep = require('../../../controller/step-control/class/recording-step')
const { waitTillScreenshotEqualToCount, waitTillSnapshotQueueCleared } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Record Manager - logEvent- waitForElement', () => {
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

    it('should add wait for element against step that has ElementSelector automatically', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.activePage.locator(Locator.input.locator).click()
        await recordManager.browserControl.activePage.locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 50))
        assert.deepEqual(recordManager.stepControl.steps.length, 7, 'we expect to see 7 steps. 1 go to context, 1 wait for element, 1 click, 1 wait, 1 click, 1 wait frame, 1 goto frame')
        assert.deepEqual(recordManager.stepControl.steps[1].command, 'waitforElement', 'the waitforElement should be added')
        assert.deepEqual(recordManager.stepControl.steps[1].parameter[2].value > 0, true, 'the timeout should be populated')
        assert.deepEqual(recordManager.stepControl.steps[3].command, 'waitforElement', 'the waitforElement should be added')
        assert.deepEqual(recordManager.stepControl.steps[3].parameter[2].value > 0, true, 'the timeout should be populated')

    }).timeout(10000)
    it('should not add wait step against element that does not have element selector', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.waitForInit()
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.activePage.locator(Locator.input.locator).click()
        let step = recordManager.stepControl.steps[0]
        let functionASt = recordManager.functionControl.store.getFunction('gotoUrl')
        let newStep = RecordingStep.restore(step, functionASt, 'gotoUrl')
        recordManager.exposeLogEvent()(newStep)
        await new Promise(resolve => setTimeout(resolve, 50))
        assert.deepEqual(recordManager.stepControl.steps.length, 6, 'we expect to see 4 steps. 1 go to context, 1 wait for element, 1 click, 1 gotoUrl, 1 go to frame, 1 wait for frame')
    }).timeout(10000)

})