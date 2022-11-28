class EventBlackList {
    /**
     * 
     * @param {object} input
     * @param {string[]} input.ignoredEventList
     */
    constructor({
        ignoredEventList = ['scroll', 'mouseup', 'mousedown']
    } = {}) {
        this._ignoredEventList = ignoredEventList
        this._isRecording = true
        this._recordingStopTime = null
        this.recordingGracePeriod = 5000
    }
    get ignoredEventList() {
        return this._ignoredEventList
    }
    set ignoredEventList(events) {
        this._ignoredEventList = events
    }
    get isRecording() {
        return this._isRecording
    }
    /**
     * Check if we are still aceeptng new step
     */
    get isAcceptNewStep() {
        //if recording status is true, then we accept new step anyway
        if (this.isRecording == true)
            return true
        //if recording status is false yet we are still in the grace period(5s), we will acept that
        let currentTime = Date.now()
        let elapsedTimeSinceRecordingStopMs = currentTime - this._recordingStopTime
        if (elapsedTimeSinceRecordingStopMs <= this.recordingGracePeriod)
            return true

        //if we are beyong grace period, we will not accept that
        return false
    }
    startRecording() {
        this._isRecording = true
        this._recordingStopTime = null
    }
    stopRecordingWithGracePeriod() {
        this._isRecording = false
        this._recordingStopTime = Date.now()
    }
    stopRecordingWithoutGracePeriod() {
        this._isRecording = false
        this._recordingStopTime = Date.now() - this.recordingGracePeriod - 100
    }



}
module.exports = EventBlackList