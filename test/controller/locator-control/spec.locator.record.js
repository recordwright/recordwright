const LocatorControl = require('../../../controller/locator-control')
const path = require('path')
const assert = require('assert')
const locatorInfo = require('./baseline/recordwright-locator-priorchange.js')
const fs = require('fs')
const config = require('../../../config')
describe('Locator Control', () => {
    it('should parse locator from recordwright-locator-1.js', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        let locatorKeyList = Object.keys(locatorInfo)
        for (let i = 0; i < locatorKeyList.length; i++) {
            let locatorKey = locatorKeyList[i]
            assert.equal(locatorControl.__locatorLibrary[i].Locator, locatorInfo[locatorKey].locator)
            assert.equal(locatorControl.__locatorLibrary[i].screenshot, locatorInfo[locatorKey].screenshot)
            assert.equal(locatorControl.__locatorLibrary[i].path, locatorInfo[locatorKey].displayName)
            assert.equal(locatorControl.__locatorLibrary[i].locatorSnapshotPath, locatorInfo[locatorKey].snapshot)
            assert.equal(locatorControl.__locatorLibrary[i].locatorSnapshot.length, 0)

        }
    })
    it('should set reset rest of variable and set expected value correctly', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        locatorControl.exposeSetActiveLocator()([0])
        assert.equal(locatorControl.__locatorLibrary[0].selector, true)
        assert.equal(locatorControl.__locatorLibrary[1].selector, null)
        locatorControl.exposeSetActiveLocator()([1])
        assert.equal(locatorControl.__locatorLibrary[0].selector, null)
        assert.equal(locatorControl.__locatorLibrary[1].selector, true)
    })
    it('should get active selector correctly', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        for (let i = 0; i < locatorControl.__locatorLibrary.length; i++) {
            locatorControl.exposeSetActiveLocator()([i])
            let activeLocators = locatorControl.exposeGetActiveSelectors()()
            assert.equal(activeLocators.length, 1)
            assert.equal(activeLocators[0].Locator, locatorControl.__locatorLibrary[i].Locator)
        }
    })
    it('should copy picture and snapshot from temp folder to picture path and with relative folder to component path', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        let originalPicPath = path.join(__dirname, './baseline/test.png')
        let componentPicPath = path.join(__dirname, '../../sample-project/componentPic/test.png')
        let snapshotPath = path.join(__dirname, '../../sample-project/locator/test.json')
        try {
            fs.unlinkSync(componentPicPath)
        } catch (error) {

        }
        try {
            fs.unlinkSync(snapshotPath)
        } catch (error) {

        }
        await locatorControl.updateLocator('test', '/html', originalPicPath, ['sample1', 'sample2'], originalPicPath)
        try {
            fs.accessSync(componentPicPath)
            fs.unlinkSync(componentPicPath)
        } catch (error) {
            assert.fail('Picture is not copyed to component pic folder correctly')
        }
        try {
            fs.accessSync(snapshotPath)
            fs.unlinkSync(snapshotPath)
        } catch (error) {
            assert.fail('snapshot is not generated correctly')
        }

    }).timeout(10 * 1000)
    it('should add locator and return locator info', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        let originalPicPath = path.join(__dirname, './baseline/test.png')
        let newLocator = await locatorControl.updateLocator('test', '/html', originalPicPath, ['sample1', 'sample2'], originalPicPath)
        //new locator should be returened
        assert.notEqual(newLocator, null)
        assert.equal(newLocator.path, 'test')
        assert.equal(newLocator.Locator, '/html')
        assert.equal(newLocator.screenshot, 'componentPic/test.png')
        assert.deepEqual(newLocator.locatorSnapshot, ['sample1', 'sample2'])
        assert.equal(newLocator.locatorSnapshotPath, 'locator/test.json')
    })
    it('should update locator and return null', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        let originalPicPath = path.join(__dirname, './baseline/test.png')
        let newLocator = await locatorControl.updateLocator('get started', '/html', originalPicPath, ['sample1', 'sample2'], originalPicPath)
        //new locator should be returened
        assert.equal(newLocator, null)
        newLocator = locatorControl.__locatorLibrary.find(item => item.path == 'get started')
        assert.equal(locatorControl.__locatorLibrary.length, 2)
        assert.equal(newLocator.path, 'get started')
        assert.equal(newLocator.Locator, '/html')
        assert.equal(newLocator.screenshot, 'componentPic/get started.png')
        assert.deepEqual(newLocator.locatorSnapshot, ['sample1', 'sample2'])
        assert.equal(newLocator.locatorSnapshotPath, 'locator/get started.json')
    })
    it('should output locator correctly', async () => {
        let locatorPath = path.join(__dirname, './baseline/recordwright-locator-priorchange.js')
        let locatorControl = new LocatorControl(locatorPath)
        let originalPicPath = path.join(__dirname, './baseline/test.png')
        await locatorControl.updateLocator('test', '/html', originalPicPath, ['sample1', 'sample2'], originalPicPath)
        await locatorControl.outputLocatorToDisk()

        let locatorOutput = fs.readFileSync(config.code.locatorPath)
        let locatorBaselinePath = path.join(__dirname, './baseline/recordwright-locator-afterchange.js')
        let locatorBaseline = fs.readFileSync(locatorBaselinePath)
        assert.equal(locatorOutput.toString(), locatorBaseline.toString())
    })
})