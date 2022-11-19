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
let eventRecorder = new BrowserEventRecorder(EVENTCONST)
window.eventRecorder = eventRecorder
await eventRecorder.potentialMatchManager.updateBluestoneRegisteredLocator()
await eventRecorder.potentialMatchManager.scanLocator()
window.takePictureSnapshot()




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


/**
 * Create an observer instance linked to the callback function
 * @param {Event[]} mutationsList 
 * @param {*} observer 
 * @returns 
 */
const mutationObserverCallback = function (mutationsList, observer) {
    //discard style change because that's how we change the color
    let updatedMutationList = mutationsList.filter(item => item.type != 'attributes' || item.attributeName != 'style')
    //discard style that is introduced as we take snapshot
    updatedMutationList = updatedMutationList.filter(item => item.target != document.body.parentElement || item.type != 'childList' || !(item.removedNodes.length == 1 && item.removedNodes[0].style != null))
    updatedMutationList = updatedMutationList.filter(item => item.target != document.body.parentElement || item.type != 'childList' || !(item.addedNodes.length == 1 && item.addedNodes[0].style != null))
    if (updatedMutationList.length == 0) return

    // console.log(mutationsList)
    // captureScreenshot('dom tree change')
    //only proceed change that is introduced by RPA engine or code change
    // captureHtml('dom tree change')

    /**@type {import('./PotentialMatchManager').PotentialMatchManager} */
    eventRecorder.potentialMatchManager.scanLocator()
    window.takePictureSnapshot()
    console.log(mutationsList)
}

const observer = new MutationObserver(mutationObserverCallback);
// Start observing the target node for configured mutations
observer.observe(document, config);


