const LocatorControl = require('../locator-control')
let config = require("../../config")
const BrowserManager = require('../browser-control')
class RecordManager {
    constructor(io) {
        this.io = io
        this.locatorControl = new LocatorControl(config.code.locatorPath)
        this.funcDict = this._initFuncDict()
        this.browserManager = new BrowserManager(config.recordwright.use, this.funcDict, io)
    }
    async waitForInit() {
        await this.browserManager.waitForInit()
    }
    _initFuncDict() {
        return {
            setActiveLocator: this.locatorControl.setActiveLocator,
            getActiveSelectors: this.locatorControl.getActiveSelectors
        }
    }
}
module.exports = RecordManager