module.exports = {
    'input': {
        locator: '//input[@placeholder]',
        screenshot: '',
        displayName: 'input',
        snapshot: './locator/input.json'
    },
    'close button': {
        locator: '.modal-card-close-button',
        screenshot: 'componentPic/close_button.png',
        displayName: 'close button',
        snapshot: './locator/close button.json'
    },
    'test': {
        locator: '/html',
        screenshot: 'componentPic/test.png',
        displayName: 'test',
        snapshot: './locator/test.json'
    },
    'paragrah-duplicate-1': {
        locator: '//*[.="Double-click to edit a todo"]',
        screenshot: 'componentPic/test.png',
        displayName: 'paragrah-duplicate-1',
        snapshot: './locator/test.json'
    },
    'paragrah-duplicate-2': {
        locator: '//*[.="Double-click to edit a todo"]',
        screenshot: 'componentPic/test.png',
        displayName: 'paragrah-duplicate-2',
        snapshot: './locator/test.json'
    },
    'test frame 2': {
        locator: '#test-frame-2',
        displayName: 'main frame',
    },
    'Evan You': {
        locator: "//a[.='Evan You']",
        displayName: 'Evan You',
    }
};