// /**@type {Object.<string, import('./class/ElementSelector')>} */
module.exports = {
    "input": {
        displayName: 'input',
        locator: '//input[@placeholder]',
    },
    'close button': {
        locator: '.modal-card-close-button',
        screenshot: 'componentPic/close_button.png',
        displayName: 'close button',
        snapshot: './locator/close button.json'
    },
}