const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { injectIframe } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Resource Manager - stepControl - gotoFrame', () => {
    let recordwrightBackend = new RecordWrightBackend({})
    let locatorPath = path.join(__dirname, './files/locator.js')

    let recordManager = new RecordManager({ locatorPath: locatorPath })
    recordManager.runtimeSetting.ignoredEventList = ['scroll']
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
    it('should switch from main page to frame correctly', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        let iFrameId = 'test1'
        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: iFrameId
        })
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.activePage.click(Locator.input.locator)
        await new Promise(resolve => setTimeout(resolve, 50))
        await recordManager.browserControl.activePage.frame('test1').click(Locator.input.locator)
        await new Promise(resolve => setTimeout(resolve, 50))
        assert.deepEqual(recordManager.stepControl._rawStepRepo.length, 6)
        //for step 1 to 3, the iframe should be empty because they are in main frame
        for (let i = 0; i < 3; i++) {
            assert.deepEqual(recordManager.stepControl._rawStepRepo[i].iframe, '')
        }

        //for locator 4 to 6, the iframe should be some locator
        let iframeLocator = recordManager.stepControl._rawStepRepo[3].iframe
        for (let i = 4; i < 6; i++) {
            assert.deepEqual(iframeLocator, recordManager.stepControl._rawStepRepo[i].iframe)
        }
        let iframeVisible = await recordManager.browserControl.activePage.locator(iframeLocator).isVisible()
        assert.equal(iframeVisible, true)
    }).timeout(10000)
    it('should switch in between multipe iframe')
    it('should switch back to main page')
})