const LocatorControl = require('../locator-control')
let config = require("../../config")
const BrowserControl = require('../browser-control')
class RecordManager {
    constructor(io) {
        this.io = io
        this.locatorControl = new LocatorControl(config.code.locatorPath)
        this.funcDict = this._initFuncDict()
        this.browserManager = new BrowserControl(config.recordwright.use, this.funcDict, io)
    }
    async waitForInit() {
        await this.browserManager.waitForInit()
    }
    _initFuncDict() {
        return {
            setActiveLocator: this.locatorControl.exposeSetActiveLocator(),
            getActiveSelectors: this.locatorControl.exposeGetActiveSelectors(),
            getDefinedLocator: this.locatorControl.exposeGetDefinedLocator()

        }
    }
    functionWrapper() {

    }
}
module.exports = RecordManager