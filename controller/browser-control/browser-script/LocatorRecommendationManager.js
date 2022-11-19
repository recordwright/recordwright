import { findRobustLocatorForSelector } from "http://localhost:3600/resource/js/robustLocatorGen.js";
export class LocatorRecommendationManager {
    /**
     * 
     * @param {string[]} locatorPriority 
     */
    constructor(locatorPriority) {
        this.elapsedTimeList = []
        this.startTime = null
        this.endTime = null
        this.backupGenOngoing = false
        this.locatorPriority = locatorPriority

    }
    /**
     * return list of locator backup
     * @param {HTMLElement} target 
     * @return {string[]}
     */
    async getLocatorBackup(target) {
        this.backupGenOngoing = true
        this.startTime = Date.now()
        let result = findRobustLocatorForSelector(target, this.locatorPriority)
        window.updateRecommendedLocators(result)
        result = ''
        this.endTime = Date.now()
        this.elapsedTimeList = endTime - startTime
        this.elapsedTimeList.push(this.elapsedTimeList)
        this.backupGenOngoing = false

    }
}