
class Locator {
    /**
     * Initialize new locator object
     * @param {string} locators xpath or css selector
     * @param {string} screenshot  path to the screenshot
     * @param {string} path  path specific locator object
     * @param {string} locatorSnapshotPath the path to the locator
     * @param {string} locatorSnapshot locator snapshot during defined time
     */
    constructor(locators, screenshot, path, locatorSnapshot, locatorSnapshotPath) {
        this.Locator = locators
        this.screenshot = screenshot
        this.path = path
        this.selector = false
        this.locatorSnapshot = locatorSnapshot
        this.locatorSnapshotPath = locatorSnapshotPath
    }
}

module.exports = Locator