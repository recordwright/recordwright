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
})