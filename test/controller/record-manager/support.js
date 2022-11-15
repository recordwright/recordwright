/**
 * 
 * @param {RecordManager} recordManager 
 * @returns 
 */
let waitTillSnapshotQueueCleared = async function (recordManager) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100))
        let queueLength = recordManager.browserControl.activeSnapshotWorker._queue.length
        if (queueLength == 0)
            break
    }
    return
}
/**
* 
* @param {RecordManager} recordManager 
* @param {number} count
* @returns 
*/
let waitTillScreenshotEqualToCount = async function (recordManager, count) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100))
        let screenshotCount = recordManager.browserControl.activeSnapshotWorker.records.length
        if (screenshotCount == count)
            break
    }
    return
}
module.exports = {
    waitTillSnapshotQueueCleared, waitTillScreenshotEqualToCount
}