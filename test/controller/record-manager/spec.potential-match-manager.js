const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const { injectIframe } = require('../record-manager/support')
const assert = require('assert')
const Locator = require('./files/locator')
const locatorMasterPotentialMatch = require('./files/locator1')
const path = require('path')
describe('Potential Match Manager', () => {
    let locatorPath = path.join(__dirname, './files/locator.js')
    let recordwrightBackend = new RecordWrightBackend()
    let recordManager = new RecordManager({ locatorPath: locatorPath })
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    after(async function () {
        await recordwrightBackend.closeApp()
        if (recordManager.browserControl)
            await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('should mark element with 1 potential match as green', async () => {

        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserControl.activePage.locator(Locator['input'].locator)
        await btnGetStarted.hover()
        let backgroundColor = await btnGetStarted.evaluate(item => {
            return item.style.backgroundColor
        })
        assert.equal(backgroundColor, 'rgba(0, 223, 145, 0.45)')
    }).timeout(500000)
    it('should mark element with no potential match as red', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserControl.activePage.locator('//h1')
        await btnGetStarted.hover()
        let backgroundColor = await btnGetStarted.evaluate(item => {
            return item.style.backgroundColor
        })
        assert.equal(backgroundColor, 'rgba(255, 0, 145, 0.45)')

    }).timeout(5000)
    it('should mark element with selected index as green', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserControl.activePage.locator(Locator['paragrah-duplicate-1'].locator)
        let selectedIndex = await btnGetStarted.evaluate(ele => {
            /**@type {object[]} */
            let potetntialMatchList = window.eventRecorder.potentialMatchManager.getPotentialMatchByTarget(ele)
            window.eventRecorder.potentialMatchManager.setElementSelectorIndex('//*[.="Double-click to edit a todo"]', potetntialMatchList[0])
            return window.eventRecorder.potentialMatchManager.getElementSelectorIndex(ele)
        })
        assert.equal(selectedIndex, 3)
        await btnGetStarted.hover()
        await new Promise(resolve => setTimeout(resolve, 500))
        let backgroundColor = await btnGetStarted.evaluate(elem => {
            return elem.style.backgroundColor
        })
        assert.equal(backgroundColor, 'rgba(0, 223, 145, 0.45)')
    }).timeout(10000)
    it('should keep selected element green after page is changed', async () => {
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserControl.activePage.locator(Locator['paragrah-duplicate-1'].locator)
        let selectedIndex = await btnGetStarted.evaluate(ele => {
            /**@type {object[]} */
            let potetntialMatchList = window.eventRecorder.potentialMatchManager.getPotentialMatchByTarget(ele)
            window.eventRecorder.potentialMatchManager.setElementSelectorIndex('//*[.="Double-click to edit a todo"]', potetntialMatchList[0])
            return window.eventRecorder.potentialMatchManager.getElementSelectorIndex(ele)
        })
        await recordManager.browserControl.activePage.evaluate(item => {
            let ele = document.querySelector('h1')
            ele.innerText = 'sa'
        })
        await new Promise(resolve => setTimeout(resolve, 500))
        await btnGetStarted.hover()
        await new Promise(resolve => setTimeout(resolve, 100))
        let backgroundColor = await btnGetStarted.evaluate(elem => {
            return elem.style.backgroundColor
        })
        assert.equal(backgroundColor, 'rgba(0, 223, 145, 0.45)')
    }).timeout(20000)

    it('should log active locators in masterPotentialMatch from main frame', async () => {
        //record wright should only return active locator from main frameto avoid overriden from multiple frame
        recordManager.runtimeSetting.ignoredEventList = ['scroll', 'mousedown', 'mouseup']
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')


        let todoMvcLink = 'https://todomvc.com/'
        let EvanYouWebsiteLink = 'https://evanyou.me/'


        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: locatorMasterPotentialMatch['test frame 1'].locator.replace('#', ''),
            url: EvanYouWebsiteLink
        })
        await new Promise(resolve => setTimeout(resolve, 100))
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        //confirm masterPotentialMatchList is populated correctly in the main frame
        let masterPotentialMatch = await recordManager.browserControl.activePage.evaluate(item => {
            return eventRecorder.potentialMatchManager.masterPotentialMatch
        })
        let frameKeys = Object.keys(masterPotentialMatch)
        assert.deepEqual(frameKeys.length, 2, 'There expect to be exact 2 frames')
        assert.deepEqual(masterPotentialMatch['root'].length, 5, '5 potential match in the main frames')
        assert.deepEqual(masterPotentialMatch['0'].length, 2, '2 potential match in the evan you frame')

    }).timeout(5000)
})