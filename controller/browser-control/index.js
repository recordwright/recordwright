const config = require('../../config')
const { chromium, devices } = require('playwright');
const path = require('path')

class BrowserControl {
    /**
     * 
     * @param {object} browserConfig 
     * @param {Object.<string,Function>} exposedFunc 
     * @param {object} io 
     */
    constructor(browserConfig = config.recordwright.use, exposedFunc = [], io) {
        this.browser = null
        this.activePage = null
        this.initCompleted = true
        this.browserConfig = {
            args: browserConfig.launchOptions.args,
            headless: false,
            ...browserConfig
        }
        this.browserList = []
        this.exposedFunc = exposedFunc
        this.io = io

    }
    /**
     * Keep waiting till initialization is completed
     */
    async waitForInit() {
        while (this.initCompleted == false) {
            await new Promise(resolve => { setTimeout(resolve, 500) })
        }
    }

    /**
     * Initialize browser instances
     */
    async createBrowserContext() {
        this.initCompleted = false
        //-----------------------main func------------------------
        this.browser = await chromium.launch(this.browserConfig)

        this.activePage = await this.browser.newPage(this.browserConfig)
        //inject master scripts whenever a frame/page is attached
        let scriptPath = path.join(__dirname, './init-script/index.js')
        await this.activePage.addInitScript({ path: scriptPath })

        //expose function from all over the places
        for (let funcName of Object.keys(this.exposedFunc)) {
            await this.activePage.exposeFunction(funcName, this.exposedFunc[funcName])
        }
        //-----------------------main func complete---------------
        this.initCompleted = true
    }

    async
}
module.exports = BrowserControl