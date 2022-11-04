const { Page } = require('playwright')
const path = require("path")
class WorkerRecordEntry {
    /**
     * 
     * @param {string} selector 
     * @param {string} path full path to captured file
     */
    constructor(selector, path) {
        this.timeStamp = null
        this.path = path
        this.isCaptureDone = false
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
        /**@type {string[]} */
        this.records = []
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
    exposeTakeSnapshot() {
        let doSnapshotOperation = this._snapshotOperation
        let taskQueue = this._queue
        let records = this.records
        let page = this.page
        let filePath = this.getNewSnapshotPath()
        async function takeSnapshot(isMainThread = false) {
            if (taskQueue.length >= 2 && isMainThread == false) {
                return
            }
            if (taskQueue.length == 1 && isMainThread == false) {
                taskQueue.push('')
                return
            }
            if (taskQueue.length == 0) {
                taskQueue.push('')
            }

            let snapshotPath = await doSnapshotOperation(page, filePath)
            records.push(snapshotPath)
            taskQueue.pop()
            if (taskQueue.length > 0) {
                takeSnapshot(true)
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