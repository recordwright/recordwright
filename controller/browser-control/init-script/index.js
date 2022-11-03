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
Object.keys(EVENTCONST).forEach(item => {
    document.addEventListener(item, event => {
        /**@type {} */
        BrowserEventRecorder
    }, { capture: true })
})

console.log('hello world from event-recorder')