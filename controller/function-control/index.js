let functionParser = require('./function-parser')
class FunctionControl {
    /**
     * 
     * @param {string} locatorPath path to the recordwright-locator.js
     */
    constructor(locatorPath) {
        this.store = new functionParser(locatorPath)
    }
}
module.exports = FunctionControl