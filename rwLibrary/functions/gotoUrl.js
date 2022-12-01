
const { test, Page, Frame } = require('@playwright/test')
const ElementSelector = require('../class/ElementSelector')
const RecordwrightFunc = require('../class/RecordwrightFunc')
const HealingSnapshot = require('../class/HealingSnapshot')
const findElement = require('./findElement')
/**
 * Navigate browser to specific url
 * @param {Object} input
 * @param {Page} input.page 
 * @param {string} input.url the url you would like to go
 */
exports.gotoUrl = async function (input) {
    class mainClass extends RecordwrightFunc {
        async getLog() {
            return `Navigate to  "${input.url}"`
        }
        async func() {
            let iRetryCount = 0
            //override existing url with env vaiable
            let url = this.getCurrentUrl(input.url)




            let link = url

            for (iRetryCount = 0; iRetryCount < 5; iRetryCount++) {
                try {

                    await input.page.goto(link)
                    break
                } catch (error) {
                    console.log('Unable to go to ' + link)
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
            if (iRetryCount == 5) {
                assert.fail('Unable to go to ' + link)
            }

            return `Goto ${url} success!`

        }
        getCurrentUrl(baseUrl) {
            let url = baseUrl
            if (process.env.BLUESTONE_URL != null && process.env.RECORDWRIGHT_URL != '') {
                let originalUrlComponent = new URL(url)
                let newUrlHost = new URL(process.env.RECORDWRIGHT_URL)
                originalUrlComponent.username = newUrlHost.username
                originalUrlComponent.password = newUrlHost.password
                originalUrlComponent.host = newUrlHost.host
                originalUrlComponent.protocol = newUrlHost.protocol
                url = originalUrlComponent.toString()
            }
            return url
        }

    }

    let result = await RecordwrightFunc.entry(mainClass, input)
    return result

}

