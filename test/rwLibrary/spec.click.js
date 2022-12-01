const rwFunc = require('../../rwLibrary/recordwright-func')
const config = require('./support/config.gotoUrl')
const { chromium, Browser } = require('playwright')
const assert = require('assert')
const locator = require('./support/Locator')

describe('Recordwright Library - click', () => {
    it('should click', async () => {
        let browser = await chromium.launch({ ...config.launchOption, headless: true })
        await browser.newPage()
        let { context, frame, page } = await rwFunc.initialize({ browser: browser })
        let todoMvcLink = 'https://todomvc.com/examples/vue/'
        let EvanYouWebsiteLink = 'https://evanyou.me/'
        await rwFunc.gotoUrl({ page: page, url: todoMvcLink })
        await rwFunc.waitforElement({ frame: frame, element: locator['Evan You'], timeout: 1000 })
        await rwFunc.click({ frame: frame, element: locator['Evan You'] })
        let url = await page.evaluate(() => {
            return window.location.href
        })
        assert.deepEqual(url, EvanYouWebsiteLink, `The link is different from expectation`)
        console.log()

    }).timeout(5000000)

})