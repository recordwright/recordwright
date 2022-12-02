const rwFunc = require('../../rwLibrary/recordwright-func')
const config = require('./support/config.gotoUrl')
const { chromium, Browser } = require('playwright')
const assert = require('assert')

describe('Recordwright Library - createNewContext', () => {
    it('should create new context', async () => {
        let browser = await chromium.launch({ ...config.launchOption, headless: true })
        await browser.newPage()
        let { context, frame, page } = await rwFunc.initialize({ browser: browser });
        assert.equal(browser.contexts().length, 1, 'there should be exact 1 context upon initialization')
        assert.equal(browser.contexts()[0].pages().length, 1, 'there should be exact 1 page');

        ({ frame, page } = await rwFunc.createNewContext({ browser }));
        assert.equal(browser.contexts().length, 2, 'there should be exact 1 context upon initialization')
        assert.equal(browser.contexts()[1].pages().length, 1, 'there should be exact 1 page');
        assert.deepEqual(browser.contexts()[1].pages()[0], page, 'it should returns right page');


    }).timeout(5000)

})