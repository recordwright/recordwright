const path = require('path')
const fs = require('fs')
let config = {
    app: {
        port: process.env.port || 3600
    },
    recordwright: {
        name: 'chromium',
        use: {
            headless: false,
            launchOptions: {
                args: [
                ]
            }
        }
    },
    bluestoneJson: process.env.bluestonePath || path.join(__dirname, './test/sample-project/recordwright.json'),
    code: {
        userFuncPath: path.join(__dirname, './test/sample-project/recordwright-func.js'),
        locatorPath: path.join(__dirname, './test/sample-project/bluestone-locator.js'),
        scriptFolder: path.join(__dirname, './test/sample-project/script'),
        configPath: path.join(__dirname, './test/sample-project/config.js'),
        inbuiltFuncPath: path.join(__dirname, './rwLibrary/recordwright-func.js'),
        pictureFolder: path.join(__dirname, './test/sample-project/componentPic'),
        locatorSnapshotFolder: path.join(__dirname, './test/sample-project/componentPic'),
        urlBlackList: [],
        customLocatorEnginePath: path.join(__dirname, './public/javascript/customLocator.js'),
        dataPath: path.join(__dirname, './test/sample-project/data'),
        locatorAttributePreference: []
    },
    recording: {
        captureHtml: false
    },
    projectEnvVar: {
        executionOperationTimeout: 0,
        isAutoSnapshot: true

    }

}
function configFunc() {
    let projectInfo = fs.readFileSync(config.bluestoneJson)
    let projectObj = JSON.parse(projectInfo.toString())
    let projectFolder = path.dirname(config.bluestoneJson)
    config.code.userFuncPath = path.join(projectFolder, projectObj.function)
    config.code.locatorPath = path.join(projectFolder, projectObj.locator)
    config.code.scriptFolder = path.join(projectFolder, projectObj.test)
    config.code.configPath = path.join(projectFolder, projectObj.config)
    config.code.pictureFolder = path.join(projectFolder, projectObj.pic)
    config.code.urlBlackList = projectObj.urlBlackList
    config.code.locatorAttributePreference = projectObj.locatorAttributePreference || []
    config.code.locatorSnapshotFolder = path.join(projectFolder, 'locator')
    //load recordwright config

    if (projectObj.config) {
        let recordwrightConfigPath = path.join(projectFolder, projectObj.config)
        config.recordwright = require(recordwrightConfigPath).projects[0]

        //inject recordwright related flags for arguments
        config.recordwright.use.launchOptions.args = config.recordwright.use.launchOptions.args.concat([
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
        ])
        //force headless mode to be false because bluestone need to display browser
    }

    //load locator generator engine
    if (projectObj.customLocatorEnginePath != null) {
        config.code.customLocatorEnginePath = path.join(projectFolder, projectObj.customLocatorEnginePath)
    }

    if (projectObj.captureHtmlOnRecording == true) {
        config.recording.captureHtml = true
    }
    config.code.dataPath = path.join(projectFolder, 'data')

    //popoulate enviornment variable for project
    initProjectEnv()

    return config
}

function initProjectEnv() {
    config.projectEnvVar.executionOperationTimeout = process.env.BLUESTONE_EXECUTION_OPERATION_TIMEOUT_MS
    config.projectEnvVar.isAutoSnapshot = process.env.BLUESTONE_AUTO_SNAPSHOT

}
module.exports = configFunc()