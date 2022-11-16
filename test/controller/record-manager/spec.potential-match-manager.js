const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
describe('Potential Match Manager', () => {
    let recordwrightBackend = new RecordWrightBackend()
    let recordManager = new RecordManager({})
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
})