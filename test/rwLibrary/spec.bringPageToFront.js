const rwFunc = require('../../rwLibrary/recordwright-func')
const config = require('./support/config.gotoUrl')
const { chromium, Browser } = require('playwright')
const assert = require('assert')

describe('Recordwright Library - bringPageToFront', () => {
    it('should bring page to front', async () => {
        let browser = await chromium.launch({ ...config.launchOption, headless: true })
        await browser.newPage()
        let { context, frame, page } = await rwFunc.initialize({ browser: browser });
        page1 = page;
        ({ frame, page } = await rwFunc.createNewContext({ browser }));

        ({ context, frame, page } = await rwFunc.bringPageToFront({ browser: browser, index: 0 }))
        assert.deepEqual(context, browser.contexts()[0], 'The first context should be returned')
        assert.deepEqual(page, browser.contexts()[0].pages()[0], 'The first page should be returned')
        assert.deepEqual(frame, browser.contexts()[0].pages()[0].mainFrame(), 'The main frame should be returned');

        ({ context, frame, page } = await rwFunc.bringPageToFront({ browser: browser, index: 1 }))
        assert.deepEqual(context, browser.contexts()[1], 'The 2nd context should be returned')
        assert.deepEqual(page, browser.contexts()[1].pages()[0], 'The 2nd page should be returned')
        assert.deepEqual(frame, browser.contexts()[1].pages()[0].mainFrame(), 'The main frame from 2nd page should be returned')

    }).timeout(5000)

})