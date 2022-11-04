const config = require('../../config')
const { chromium, devices } = require('playwright');
const path = require('path')
const PictureWorker = require('./class/picture-worker')
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
        this.browserList = []
        this.exposedFunc = []
        this.io = io
        this.pictureWorker = new PictureWorker(this._activePage)
    }
    get activePage() {
        return this._activePage
    }
    set activePage(page) {
        this._activePage = page
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
        this.browser = await chromium.launch({ ...this.browserConfig, headless: headless })

        this._activePage = await this.browser.newPage(this.browserConfig)
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
        this.exposedFunc = exposedFunc
        for (let funcName of Object.keys(this.exposedFunc)) {
            await this._activePage.exposeFunction(funcName, this.exposedFunc[funcName])
        }
        //-----------------------main func complete---------------
        this.initCompleted = true
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