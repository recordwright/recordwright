// /**@type {Object.<string, import('./class/ElementSelector')>} */
module.exports = {
    "get started": {
        displayName: 'get started',
        locator: "//*[text()='Get started']",
    },
    'close button': {
        locator: '.modal-card-close-button',
        screenshot: 'componentPic/close_button.png',
        displayName: 'close button',
        snapshot: './locator/close button.json'
    },
}