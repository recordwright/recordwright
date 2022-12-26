const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const path = require('path')
const locator = require('./support/Locator')
const { injectIframe } = require('../record-manager/support')
const { callInBrowserSpy } = require('../record-manager/support')
// const { chromium } = require('playwright')
describe('Operation tab', async () => {
    let recordwrightBackend = new RecordWrightBackend()
    let funcPath = path.join(__dirname, '../../sample-project/recordwright-func.js')
    let recordManager = new RecordManager({ userFuncPath: funcPath })
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    afterEach(async function () {
        await recordManager.browserControl.closeAllInstances()
        this.timeout(60000)
    })
    after(async function () {
        await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('should return category information correctly', async () => {
        await recordManager.start({ headless: true })
        await recordManager.waitForInit()
        assert.equal(recordManager.operation.functionCategories.length, 3, 'It should break functions into categories')

    }).timeout(5000)
    it('should return active custom function if criteria is met', async () => {
        recordManager.runtimeSetting.ignoredEventList = ['scroll', 'mousedown', 'mouseup']
        await recordManager.start({ headless: true })
        await recordManager.browserControl.activePage.goto('https://todomvc.com/examples/vue/')
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        // await new Promise(resolve => setTimeout(resolve, 500000))
        let btnGetStarted = await recordManager.browserControl.activePage.locator(locator['input'].locator)
        await new Promise(resolve => setTimeout(resolve, 50))
        await callInBrowserSpy(btnGetStarted)
        await new Promise(resolve => setTimeout(resolve, 50))
        let activeFunc = recordManager.operation.activeFunctionList.find(item => item.name == 'click1')
        assert.notEqual(activeFunc, null, 'function "click1" should be visible when item is there')

        //remove target element
        await btnGetStarted.evaluate(item => {
            item.remove()
        })
        btnGetStarted = await recordManager.browserControl.activePage.locator(locator['Evan You'].locator)
        await callInBrowserSpy(btnGetStarted)
        await new Promise(resolve => setTimeout(resolve, 50))
        activeFunc = recordManager.operation.activeFunctionList.find(item => item.name == 'click1')
        assert.equal(activeFunc, null, 'function "click1" should be invisible when required dom element is not there')

        //inbuilt function should be displayed all the time
        let inBuiltFuncList = ['click', 'gotoFrame', 'waitforElement', 'bringPageToFront', 'gotoUrl', 'createNewContext', 'initialize', 'change']
        for (let funcName of inBuiltFuncList) {
            activeFunc = recordManager.operation.activeFunctionList.find(item => item.name == funcName)
            assert.notEqual(activeFunc, null, `function "${funcName}" cannot be found`)
        }


    }).timeout(5000)
    it('should return active custom function in frame scenario', async () => {
        //record wright should only return active locator from main frameto avoid overriden from multiple frame
        recordManager.runtimeSetting.ignoredEventList = ['scroll', 'mousedown', 'mouseup']
        await recordManager.start({ headless: true })

        let todoMvcLink = 'https://todomvc.com/examples/vue/'
        let EvanYouWebsiteLink = 'https://evanyou.me/'

        await recordManager.browserControl.activePage.goto(EvanYouWebsiteLink)


        await injectIframe({
            page: recordManager.browserControl.activePage,
            iframeId: locator['test frame 1'].locator.replace('#', ''),
            url: todoMvcLink
        })
        await new Promise(resolve => setTimeout(resolve, 100))
        await recordManager.browserControl.__waitForPotentialMatchManagerPopoulated()
        //confirm masterPotentialMatchList is populated correctly in the main frame
        let html = await recordManager.browserControl.activePage.locator('//html')
        await callInBrowserSpy(html)
        await new Promise(resolve => setTimeout(resolve, 50))
        let activeFunc = recordManager.operation.activeFunctionList.find(item => item.name == 'click1')
        assert.notEqual(activeFunc, null, 'function "click1" should be visible when item is there')



        console.log()

    }).timeout(5000)

})