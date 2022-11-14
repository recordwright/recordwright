const { Page } = require('playwright')
const path = require("path")
const fs = require('fs').promises
class WorkerRecordEntry {
    /**
     * 
     * @param {string} selector 
     * @param {string} path full path to captured file
     */
    constructor(selector, path) {
        this.timeStamp = Date.now()
        this.path = path
        this.isCaptureDone = false
        this.selector = selector
    }
}
class WorkerBase {
    /**
     * 
     * @param {Page} page 
     */
    constructor(page) {
        this.page = page
        this._queue = []
        /**@type {WorkerRecordEntry[]} */
        this.records = []
        this._isTakeSnapshot = false
    }
    get isTakeSnapshot() {
        return this._isTakeSnapshot
    }
    set isTakeSnapshot(isTake) {
        this._isTakeSnapshot = isTake
    }
    /**
     * Create a snapshot path under public/temp/componentPic
     * @param {string} extensionName 
     */
    getNewSnapshotPath(extensionName = '') {
        let fileName = Date.now().toString() + Math.floor(Math.random() * 100).toString() + `.${extensionName}`
        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath
    }
    /**
     * At given point of time, there should only 1 instance taking snapshot.
     * @param {boolean} isMainThread 
     * @returns 
     */
    exposeTakeScreenshot() {
        // let doSnapshotOperation = this._snapshotOperation
        let taskQueue = this._queue
        let records = this.records
        let page = this.page
        let filePath = this.getNewSnapshotPath()
        let WorkerRecordEntryClass = WorkerRecordEntry
        let mainThread = null
        let context = this
        let cdpSession = null
        async function takeSnapshot(sianature = null) {
            let isMainThread = null
            while (true) {

                if (mainThread == null) {
                    isMainThread = Math.random()
                    mainThread = true
                }
                if (taskQueue.length >= 2 && isMainThread == null) {
                    return
                }
                if (taskQueue.length <= 1 && isMainThread == null) {
                    taskQueue.push('')
                    return
                }

                let snapshotPath
                try {
                    if (context.isTakeSnapshot) {
                        //take snapshot
                        snapshotPath = filePath + 'mhtml'
                        if (cdpSession == null) {
                            cdpSession = await page.context().newCDPSession(page);
                            await cdpSession.send('Page.enable');
                        }
                        let mHtmlData = null
                        try {
                            const { data } = await cdpSession.send('Page.captureSnapshot');
                            mHtmlData = data
                        } catch (error) {
                            cdpSession = await page.target().createCDPSession();
                            await cdpSession.send('Page.enable');
                        }
                        fs.writeFile(snapshotPath, mHtmlData)
                    } else {
                        //take screenshot instead
                        snapshotPath = filePath + 'jpeg'
                        let snapshot = await page.screenshot({ quality: 40, type: 'jpeg', scale: 'css' })
                        fs.writeFile(snapshotPath, snapshot)
                    }
                }

                catch (error) {
                    console.log(error)
                }
                let entry = new WorkerRecordEntryClass('', snapshotPath)
                records.push(entry)
                taskQueue.pop()
                if (taskQueue.length > 0 && isMainThread != null) {
                    continue
                }
                else {
                    mainThread = null
                    break
                }
            }
        }


        return takeSnapshot
    }
    /**
     * @param {Page} page 
     * @param {string} filePath
     * @returns {string}
     */
    async _snapshotOperation(page, filePath) { }
}
module.exports = WorkerBase