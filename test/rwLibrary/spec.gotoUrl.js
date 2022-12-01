const rwFunc = require('../../rwLibrary/recordwright-func')
const config = require('./support/config.gotoUrl')
const { chromium, Browser } = require('playwright')
const assert = require('assert')

describe('Recordwright Library - gotoUrl', () => {
    it('should initialize, navigate to url', async () => {
        let browser = await chromium.launch({ ...config.launchOption, headless: true })
        await browser.newPage()
        let { context, frame, page } = await rwFunc.initialize({ browser: browser })
        let expectedLink = 'https://todomvc.com/examples/vue/'
        await rwFunc.gotoUrl({ page: page, url: expectedLink })
        let url = await page.evaluate(() => {
            return window.location.href
        })
        assert.deepEqual(url, expectedLink, `The link is different from expectation`)
        console.log()

    }).timeout(5000)

})