const rwFunc = require('../../rwLibrary/recordwright-func')
const config = require('./support/config.gotoUrl')
const { chromium, Browser } = require('playwright')
const assert = require('assert')
const locator = require('./support/Locator')
const { injectIframe } = require('../controller/record-manager/support')

describe('Recordwright Library - gotoFrame', () => {
    it('should switch back and forth in between frames and main frames', async () => {

        let browser = await chromium.launch({ ...config.launchOption, headless: false })
        await browser.newPage()
        let { context, frame, page } = await rwFunc.initialize({ browser: browser })
        let todoMvcLink = 'https://todomvc.com/examples/vue/'
        let EvanYouWebsiteLink = 'https://evanyou.me/'
        await rwFunc.gotoUrl({ page: page, url: todoMvcLink })


        await injectIframe({
            page: page,
            iframeId: locator['test frame 1'].locator.replace('#', ''),
            url: todoMvcLink
        })
        await injectIframe({
            page: page,
            iframeId: locator['test frame 2'].locator.replace('#', ''),
            url: todoMvcLink
        })

        //ensure two frames's link is correct
        for (let frame of page.frames()) {
            let url = await frame.evaluate(() => {
                return window.location.href
            })
            assert.deepEqual(url, todoMvcLink, `The link is different from expectation`)
            let element = await rwFunc.waitforElement({ frame: frame, element: locator['Evan You'], timeout: 1000 })
            await element.evaluate(item => {
                item.href = 'https://evanyou.me'
            })
        }

        //we should be able to switch from main frame to frame and interact with element
        await rwFunc.waitforElement({ frame: frame, element: locator['test frame 1'], timeout: 1000 })
        frame = await rwFunc.gotoFrame({ page: page, element: locator['test frame 1'] })
        await rwFunc.waitforElement({ frame: frame, element: locator['Evan You'], timeout: 1000 })

        await rwFunc.click({ frame: frame, element: locator['Evan You'] })
        await frame.waitForNavigation({ timeout: 5000 })
        url = await frame.evaluate(() => {
            return window.location.href
        })
        assert.deepEqual(url, EvanYouWebsiteLink, `Unable to switch from main frame to sub frame`)

        //we should be able to switch from frame to frame
        frame = await rwFunc.gotoFrame({ page: page, element: locator['test frame 2'] })
        await rwFunc.waitforElement({ frame: frame, element: locator['Evan You'], timeout: 1000 })
        await rwFunc.click({ frame: frame, element: locator['Evan You'] })
        await frame.waitForNavigation({ timeout: 5000 })

        url = await frame.evaluate(() => {
            return window.location.href
        })
        assert.deepEqual(url, EvanYouWebsiteLink, `Unable to switch from frame to frame`)

        //we shold be able to switch from frame back to the main page
        frame = await rwFunc.gotoFrame({ page: page, element: locator['test'] })
        assert.notDeepEqual(frame, null, 'top frame should be found')
        await rwFunc.waitforElement({ frame: frame, element: locator['Evan You'], timeout: 1000 })
        await rwFunc.click({ frame: frame, element: locator['Evan You'] })
        await page.waitForTimeout(1000)

        url = await page.evaluate(() => {
            return window.location.href
        })
        assert.deepEqual(url, EvanYouWebsiteLink, `Unable to switch from frame to main frame`)

    }).timeout(5000)
})