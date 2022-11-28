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
    constructor(browserConfig = config.recordwright.use, io, exposedFunc = {}) {
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
        this.exposedFunc = exposedFunc
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
    async createBrowserContext({ headless = false } = {}) {
        this.initCompleted = false
        //-----------------------main func------------------------
        let launchOption = { ...this.browserConfig, headless: headless }
        if (this.browser == null) {
            this.browser = await chromium.launch(launchOption)
        }
        let context = await this.browser.newContext(launchOption)
        this.activeContext = context
        let contextIndex = this.browser.contexts().length - 1

        this._activePage = await this.activeContext.newPage(this.browserConfig)
        this.activeSnapshotWorker = new SnapshotWorker(this._activePage)
        //inject master scripts whenever a frame/page is attached

        let currentUrl = `http://localhost:${config.app.port}/resource/js/index.js`

        //create init function. We cannot put it in the other class because it will throw error
        let initFunc = async function (input) {
            let { currentUrl, contextIndex } = JSON.parse(input)
            console.log(`Load Information from ${currentUrl}`)
            //wait till document is ready and inject event recorder script
            while (true) {
                if (document != null && document.body != null) break
                await new Promise(resolve => setTimeout(resolve, 5))
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
            //wait till event recorder element is initialized
            while (true) {
                if (window.eventRecorder == null) {
                    await new Promise(resolve => setTimeout(resolve, 5))
                    continue
                }
                /**@type {import('./browser-script/event-recorder').BrowserEventRecorder} */
                let eventRecorder = window.eventRecorder
                eventRecorder.setBrowserIndex(contextIndex)
                break
            }


        }
        await this._activePage.addInitScript(initFunc, JSON.stringify({ currentUrl, contextIndex }))

        //expose function from all over the places
        await this._exposeFunctionToBrowser(this._activePage)
        //-----------------------main func complete---------------
        this.initCompleted = true
    }
    /**
     * Expose function to browser
     * @param {import('playwright').Page} activePage 
     */
    async _exposeFunctionToBrowser(activePage) {
        //take picture snapshot need to updated according to context
        delete this.exposedFunc['takePictureSnapshot']

        if (this.activeSnapshotWorker) {
            this.exposedFunc['takePictureSnapshot'] = this.activeSnapshotWorker.exposeTakeScreenshot()
        }

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