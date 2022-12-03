const rwFunc = require('../../rwLibrary/recordwright-func')
const config = require('./support/config.gotoUrl')
const { chromium, Browser } = require('playwright')
const assert = require('assert')
const locator = require('./support/Locator')

describe('Recordwright Library - change', () => {
    it('should change simple text box', async () => {
        let browser = await chromium.launch({ ...config.launchOption, headless: true })
        await browser.newPage()
        let { context, frame, page } = await rwFunc.initialize({ browser: browser })
        let todoMvcLink = 'https://todomvc.com/examples/vue/'
        let desiredValue = `hello world`
        await rwFunc.gotoUrl({ page: page, url: todoMvcLink })
        await rwFunc.waitforElement({ frame: frame, element: locator['Evan You'], timeout: 1000 })
        await rwFunc.click({ frame: frame, element: locator['input'] })
        await rwFunc.change({ frame: frame, element: locator['input'], text: desiredValue })
        let element = await rwFunc.waitforElement({ frame: frame, element: locator['input'], timeout: 1000 })
        let currentValue = await element.evaluate(item => {
            return item.value
        })
        assert.deepEqual(currentValue, desiredValue, `The text value does not change as expected`)
        console.log()

    }).timeout(5000)

})