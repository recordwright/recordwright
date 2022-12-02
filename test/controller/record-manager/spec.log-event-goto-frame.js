const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { injectIframe } = require('./support')
const assert = require('assert')
const Locator = require('./files/locator')
const fs = require('fs')
const path = require('path')
const config = require('../../../config')
describe('Record Manager - stepControl - gotoFrame', () => {
    let recordwrightBackend = new RecordWrightBackend({})
    let locatorPath = path.join(__dirname, './files/locator.js')

    let recordManager = new RecordManager({ locatorPath: locatorPath })
    recordManager.runtimeSetting.ignoredEventList = ['scroll']
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
    it('should switch from main page to frame correctly', async () => {
        recordManager.runtimeSetting.ignoredEventList = ['scroll']
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
        // await new Promise(resolve => setTimeout(resolve, 500000))
        await recordManager.browserControl.activePage.frameLocator(`#${iFrameId}`).locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 150))
        assert.deepEqual(recordManager.stepControl._rawStepRepo.length, 6)
        //for step 1 to 3, the iframe should be empty because they are in main frame
        for (let i = 0; i < 3; i++) {
            assert.deepEqual(recordManager.stepControl._rawStepRepo[i].iframe, "//*[local-name()='html'][1]")
        }

        //for locator 4 to 6, the iframe should be some locator
        let iframeLocator = recordManager.stepControl._rawStepRepo[3].iframe
        for (let i = 4; i < 6; i++) {
            assert.deepEqual(iframeLocator, recordManager.stepControl._rawStepRepo[i].iframe)
        }
        let iframeVisible = await recordManager.browserControl.activePage.locator(iframeLocator).isVisible()
        assert.equal(iframeVisible, true)

        //there should be 1 goto frame operation 
        let gotoIFrameStepList = recordManager.stepControl.steps.filter(item => item.command == 'gotoFrame')
        assert.deepEqual(gotoIFrameStepList.length, 2)
        let iFrameIndex = recordManager.stepControl.steps.findIndex(item => item == gotoIFrameStepList[1])

        //before gotoFrame step, there should be a step waiting for element
        let waitForElementStep = recordManager.stepControl.steps[iFrameIndex - 1]
        assert.deepEqual(waitForElementStep.target, gotoIFrameStepList[1].target, 'There should be a wait step for frame')

        //the prior step before gotoFrame's iframe should be different from gotoframe
        let clickStep = recordManager.stepControl.steps[iFrameIndex - 2]
        assert.notDeepEqual(clickStep.iframe, gotoIFrameStepList[1].target, 'The frame for prior step is not the same as new frame we want to switch to')

        //the step after gotoFrame's iframe should be equal to the frame gotoFrame switch to
        let nextWaitForElementStep = recordManager.stepControl.steps[iFrameIndex + 1]
        assert.deepEqual(nextWaitForElementStep.iframe, gotoIFrameStepList[1].target, 'the step after gotoFrame iframe should be equal to the frame gotoFrame switch to')

        //the main frame's potential match should be correct
        assert.deepEqual(gotoIFrameStepList[1].finalLocator, '', 'no final locator defined for current locator')
        assert.deepEqual(gotoIFrameStepList[1].finalLocatorName, '', 'no final locator name defined for current locator')

    }).timeout(10000)
    it('should switch in between multipe iframe', async () => {
        recordManager.runtimeSetting.ignoredEventList = ['scroll', 'mousedown', 'mouseup']
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        let iFrameId1 = 'test1'
        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: iFrameId1
        })

        let iFrameId2 = Locator['test frame 2'].locator.replace('#', '')
        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: iFrameId2
        })
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.activePage.frameLocator(`#${iFrameId1}`).locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 50))
        await recordManager.browserControl.activePage.frameLocator(`#${iFrameId2}`).locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 150))

        //there should be 1 goto frame operation 
        let gotoIFrameStepList = recordManager.stepControl.steps.filter(item => item.command == 'gotoFrame')
        assert.deepEqual(gotoIFrameStepList.length, 2, 'there should be 2 goto frame operation ')
        for (let gotoIFrameStep of gotoIFrameStepList) {
            let iFrameIndex = recordManager.stepControl.steps.findIndex(item => item == gotoIFrameStep)

            //before gotoFrame step, there should be a step waiting for element
            let waitForElementStep = recordManager.stepControl.steps[iFrameIndex - 1]
            assert.deepEqual(waitForElementStep.target, gotoIFrameStep.target, 'There should be a wait step for frame')

            //the prior step before gotoFrame's iframe should be different from gotoframe
            let clickStep = recordManager.stepControl.steps[iFrameIndex - 2]
            assert.notDeepEqual(clickStep.iframe, gotoIFrameStep.target, 'The frame for prior step is not the same as new frame we want to switch to')

            //the step after gotoFrame's iframe should be equal to the frame gotoFrame switch to
            let nextWaitForElementStep = recordManager.stepControl.steps[iFrameIndex + 1]
            assert.deepEqual(nextWaitForElementStep.iframe, gotoIFrameStep.target, 'the step after gotoFrame iframe should be equal to the frame gotoFrame switch to')

            //no final locator and locator name defined for current locator
        }
        assert.ok(gotoIFrameStepList[0].target.includes(iFrameId1), 'the first iframe should be test1')
        assert.ok(gotoIFrameStepList[1].target.includes(iFrameId2), 'the 2nd iframe should be test2')
        assert.deepEqual(gotoIFrameStepList[0].finalLocator, '', 'no final locator defined for 1st iframe')
        assert.deepEqual(gotoIFrameStepList[0].finalLocatorName, '', 'no final locator name defined for 1st iframe')

        assert.notDeepEqual(gotoIFrameStepList[1].finalLocator, '', 'final locator defined for 2nd iframe')
        assert.notDeepEqual(gotoIFrameStepList[1].finalLocatorName, '', 'final locator name defined for 2nd iframe')

    }).timeout(10000)
    it('should switch back to main page', async () => {
        recordManager.runtimeSetting.ignoredEventList = ['scroll', 'mousedown', 'mouseup']
        await recordManager.start({ headless: false })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        let iFrameId1 = 'test1'
        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: iFrameId1
        })

        let iFrameId2 = 'test2'
        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: iFrameId2
        })
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        await recordManager.browserControl.activePage.frameLocator(`#${iFrameId1}`).locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 50))
        await recordManager.browserControl.activePage.locator(Locator.input.locator).click()
        await new Promise(resolve => setTimeout(resolve, 150))

        //there should be 1 goto frame operation 
        let gotoIFrameStepList = recordManager.stepControl.steps.filter(item => item.command == 'gotoFrame')
        assert.deepEqual(gotoIFrameStepList.length, 2, 'there should be 2 goto frame operation ')
        for (let gotoIFrameStep of gotoIFrameStepList) {
            let iFrameIndex = recordManager.stepControl.steps.findIndex(item => item == gotoIFrameStep)

            //before gotoFrame step, there should be a step waiting for element
            let waitForElementStep = recordManager.stepControl.steps[iFrameIndex - 1]
            assert.deepEqual(waitForElementStep.target, gotoIFrameStep.target, 'There should be a wait step for frame')

            //the prior step before gotoFrame's iframe should be different from gotoframe
            let clickStep = recordManager.stepControl.steps[iFrameIndex - 2]
            assert.notDeepEqual(clickStep.iframe, gotoIFrameStep.target, 'The frame for prior step is not the same as new frame we want to switch to')

            //the step after gotoFrame's iframe should be equal to the frame gotoFrame switch to
            let nextWaitForElementStep = recordManager.stepControl.steps[iFrameIndex + 1]
            assert.deepEqual(nextWaitForElementStep.iframe, gotoIFrameStep.target, 'the step after gotoFrame iframe should be equal to the frame gotoFrame switch to')
        }
        assert.ok(gotoIFrameStepList[0].target.includes(iFrameId1), 'the first iframe should be test1')
        assert.ok(gotoIFrameStepList[1].target.includes('html'), 'the 2nd iframe should be reflecfted to main frame')
    }).timeout(10000)
})