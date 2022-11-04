const WorkerBase = require('./worker-base')
const { Page } = require('playwright')
class PictureWorker extends WorkerBase {
    /** @type {Page} */
    constructor(page) {
        super(page)
    }
    /**
     * 
     * @param {Page} page 
     * @param {string} filePath
     * @returns {string}
     */
    async _snapshotOperation(page, filePath) {
        let picPath = filePath + '.jpeg'
        await page.screenshot({ quality: 40, type: 'jpeg', scale: 'css', path: picPath })
        return picPath
    }
}
module.exports = PictureWorker