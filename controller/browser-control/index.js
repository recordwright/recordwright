const config = require('../../config')
const { chromium, devices } = require('playwright');
const path = require('path')
const SnapshotWorker = require('./class/snapshot-worker')
class BrowserControl {
    /**
     * 
     * @param {object} browserConfig 
     * @param {Object.<string,Function>} exposedFunc 
     * @param {object} io 
     */
    constructor(browserConfig = config.recordwright.use, io) {
        this.browser = null
        /**@type {import('playwright').Page} */
        this._activePage = null
        this.initCompleted = true
        this.browserConfig = {
            args: browserConfig.launchOptions.args,
            headless: false,
            ...browserConfig
        }
        this.activeContext = null
        this.contextList = []
        this.pictureWorkerList = []
        this.exposedFunc = []
        this.io = io
        this.activeSnapshotWorker = null
    }
    get activePage() {
        return this._activePage
    }
    set activePage(page) {
        this._activePage = page
    }
    async closeAllInstances() {
        if (this.browser == null) return
        let contextList = this.browser.contexts()
        for (let context of contextList) {
            await context.close()
        }
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
    async createBrowserContext({ headless = false, exposedFunc = [] } = {}) {
        this.initCompleted = false
        //-----------------------main func------------------------
        let launchOption = { ...this.browserConfig, headless: headless }
        if (this.browser == null) {
            this.browser = await chromium.launch(launchOption)
        }
        let context = await this.browser.newContext(launchOption)
        this.activeContext = context

        this._activePage = await this.activeContext.newPage(this.browserConfig)
        this.activeSnapshotWorker = new SnapshotWorker(this._activePage)
        //inject master scripts whenever a frame/page is attached

        let currentUrl = `http://localhost:${config.app.port}/resource/js/index.js`

        //create init function. We cannot put it in the other class because it will throw error
        let initFunc = async function (currentUrl) {
            console.log(`Load Information from ${currentUrl}`)

            while (true) {
                if (document != null && document.body != null) break
                await new Promise(resolve => setTimeout(resolve, 10))
            }
            try {
                //add script block
                let finderScript = document.createElement("script");
                finderScript.setAttribute('type', 'module')
                finderScript.setAttribute('src', currentUrl)
                finderScript.setAttribute('id', 'recordwright-init-module')
                document.body.appendChild(finderScript);

            } catch (error) {
                console.log('Error During Browser Event Recorder Injection')
                console.log(error)
            }


        }
        await this._activePage.addInitScript(initFunc, currentUrl)

        //expose function from all over the places
        this._exposeFunctionToBrowser(exposedFunc, this._activePage)
        //-----------------------main func complete---------------
        this.initCompleted = true
    }
    /**
     * Expose function to browser
     * @param {Function[]} exposedFunc 
     * @param {import('playwright').Page} activePage 
     */
    async _exposeFunctionToBrowser(exposedFunc, activePage) {
        this.exposedFunc = exposedFunc
        this.exposedFunc['takePictureSnapshot'] = this.activeSnapshotWorker.exposeTakeScreenshot()
        for (let funcName of Object.keys(this.exposedFunc)) {
            await activePage.exposeFunction(funcName, this.exposedFunc[funcName])
        }
    }
    /**
     * Wait till potential match manager populated
     */
    async __waitForPotentialMatchManagerPopoulated() {
        while (true) {
            let potentialMatchCount = await this._activePage.evaluate(item => {
                return window.eventRecorder.potentialMatchManager.currentPotentialMatchList.length
            })
            if (potentialMatchCount > 0)
                break
            await new Promise(resolve => setTimeout(resolve, 200))
        }
    }

}
module.exports = BrowserControl