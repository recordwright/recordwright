class EventBlackList {
    constructor() {
        this._blackList = ['scroll']
        this._isRecording = true
    }
    get blackList() {
        return this._blackList
    }
    set blackList(events) {
        this._blackList = events
    }
    get isRecording() {
        return this._isRecording
    }
    set isRecording(status) {
        this._isRecording = status
    }

}
module.exports = EventBlackList