const RecordWrightBackend = require('../support/recordwright-backend')
const fs = require("fs")
const path = require('path')
const assert = require('assert')
describe('resource api library', () => {
    let recordwrightBackend = new RecordWrightBackend()
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    after(async function () {
        await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('should get load js file correctly', async () => {

        let res = await recordwrightBackend.getJsResource('index.js')
        let jsPath = path.join(__dirname, '../../controller/browser-control/browser-script/index.js')
        let fileContent = (fs.readFileSync(jsPath)).toString()
        assert.equal(res.data, fileContent)
        console.log()
    })
})