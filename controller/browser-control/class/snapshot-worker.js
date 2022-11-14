const { Page } = require('playwright')
const path = require("path")
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
        this._picQueue = []
        /**@type {WorkerRecordEntry[]} */
        this.pictureRecords = []
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
        let taskQueue = this._picQueue
        let records = this.pictureRecords
        let page = this.page
        let filePath = this.getNewSnapshotPath()
        let WorkerRecordEntryClass = WorkerRecordEntry
        let mainThread = null
        async function takeSnapshot(isMainThread = null) {
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
                taskQueue.push('')

                let snapshotPath
                try {
                    snapshotPath = filePath + 'jpeg'
                    await page.screenshot({ quality: 40, type: 'jpeg', scale: 'css', path: snapshotPath })
                } catch (error) {
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