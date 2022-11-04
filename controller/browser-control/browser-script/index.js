import { BrowserEventRecorder } from 'http://localhost:3600/resource/js/event-recorder.js';
let globalVar = {
    isFreezeMode: false,
    isRecordScroll: true,
    scanLocatorQueue: [],
    capturePicQueue: [],
    tabIndex: 1,
    potentialMatchManager: null
}
const EVENTCONST = {
    click: 'click',
    change: 'change',
    dblclick: 'dblclick',
    keydown: 'keydown',
    dragstart: 'dragstart',
    drop: 'drop',
    scroll: 'scroll',
    mousedown: 'mousedown',
    mouseup: 'mouseup',
    visibilitychange: 'visibilitychange'

}
/** @type {import('./event-recorder').BrowserEventRecorder} */
let eventRecorder = new BrowserEventRecorder()
window.eventRecorder = eventRecorder
await eventRecorder.potentialMatchManager.updateBluestoneRegisteredLocator()
await eventRecorder.potentialMatchManager.scanLocator()




Object.keys(EVENTCONST).forEach(item => {
    document.addEventListener(item, event => {
        eventRecorder.handleBrowserAction(event, item)
    }, { capture: true })
})

document.addEventListener('mouseover', async event => {
    eventRecorder.handleMouseOverEvent(event)
}, { capture: true })

document.addEventListener("mouseout", event => {
    eventRecorder.handleMouseOutEvent(event)
})

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const mutationObserverCallback = function (mutationsList, observer) {
    //discard style change because that's how we change the color
    let isEveryMutationStyleChange = mutationsList.every(item => item.type == 'attributes' && item.attributeName == 'style')
    if (isEveryMutationStyleChange) return

    // console.log(mutationsList)
    // captureScreenshot('dom tree change')
    //only proceed change that is introduced by RPA engine or code change
    // captureHtml('dom tree change')

    /**@type {import('./PotentialMatchManager').PotentialMatchManager} */
    eventRecorder.potentialMatchManager.scanLocator()
    window.takePictureSnapshot()
    // console.log(mutationsList)
}

const observer = new MutationObserver(mutationObserverCallback);

// Start observing the target node for configured mutations
observer.observe(document, config);

