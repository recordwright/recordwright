const LocatorControl = require('../locator-control')
let config = require("../../config")
const BrowserControl = require('../browser-control/index')
class RecordManager {
    constructor(io) {
        this.io = io
        this.locatorControl = new LocatorControl(config.code.locatorPath)
        this.browserControl = new BrowserControl(config.recordwright.use, io)
        this.funcDict = this._initFuncDict()
    }
    async waitForInit() {
        await this.browserControl.waitForInit()
    }
    async start({ headless = false } = {}) {
        await this.browserControl.createBrowserContext({ headless, exposedFunc: this.funcDict })
    }
    _initFuncDict() {
        return {
            setActiveLocator: this.locatorControl.exposeSetActiveLocator(),
            getActiveSelectors: this.locatorControl.exposeGetActiveSelectors(),
            getDefinedLocator: this.locatorControl.exposeGetDefinedLocator()

        }
    }

}
module.exports = RecordManager