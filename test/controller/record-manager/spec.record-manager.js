const RecordManager = require('../../../controller/record-manager')
describe('Record Manager', () => {
    it('it should launch application correctly', async () => {
        let recordManager = new RecordManager({})
        await recordManager.browserManager.createBrowserContext()
        await recordManager.browserManager.activePage.goto('https://playwright.dev/')
        await new Promise(resolve => setTimeout(resolve, 99999999))
    }).timeout(999999)
})