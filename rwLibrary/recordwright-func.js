const { click } = require('./functions/click')
const { gotoFrame } = require('./functions/gotoFrame')
const { waitforElement } = require('./functions/waitforElement')
const { bringPageToFront } = require('./functions/bringPageToFront')
const { gotoUrl } = require('./functions/gotoUrl')
const { createNewContext } = require('./functions/createNewContext')
const { initialize } = require('./functions/initialize')
const { change } = require('./functions/change')
module.exports = {
    click, gotoFrame, waitforElement, bringPageToFront, gotoUrl, createNewContext, initialize, change
}