const LocatorControl = require('../../../controller/locator-control')
const path = require('path')
const assert = require('assert')
const locatorInfo = require('../../sample-project/recordwright-locator-1')
const fs = require('fs')
describe('Locator Control', () => {
    it('should parse locator from recordwright-locator-1.js', async () => {
        let locatorPath = path.join(__dirname, '../../sample-project/recordwright-locator-1.js')
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
        let locatorPath = path.join(__dirname, '../../sample-project/recordwright-locator-1.js')
        let locatorControl = new LocatorControl(locatorPath)
        locatorControl.setActiveLocator([0])
        assert.equal(locatorControl.__locatorLibrary[0].selector, true)
        assert.equal(locatorControl.__locatorLibrary[1].selector, null)
        locatorControl.setActiveLocator([1])
        assert.equal(locatorControl.__locatorLibrary[0].selector, null)
        assert.equal(locatorControl.__locatorLibrary[1].selector, true)
    })
    it('should get active selector correctly', async () => {
        let locatorPath = path.join(__dirname, '../../sample-project/recordwright-locator-1.js')
        let locatorControl = new LocatorControl(locatorPath)
        for (let i = 0; i < locatorControl.__locatorLibrary.length; i++) {
            locatorControl.setActiveLocator([i])
            let activeLocators = locatorControl.getActiveSelectors()
            assert.equal(activeLocators.length, 1)
            assert.equal(activeLocators[0].Locator, locatorControl.__locatorLibrary[i].Locator)
        }
    })
    it('should copy picture from temp folder to picture path and with relative folder to component path', async () => {
        let locatorPath = path.join(__dirname, '../../sample-project/recordwright-locator-1.js')
        let locatorControl = new LocatorControl(locatorPath)
        let originalPicPath = path.join(__dirname, './baseline/test.png')
        let componentPicPath = path.join(__dirname, '../../sample-project/componentPic/test.png')
        try {
            fs.unlinkSync(componentPicPath)
        } catch (error) {

        }
        await locatorControl.updateLocator('test', '/html', originalPicPath, ['sample1', 'sample2'], originalPicPath)
        try {
            fs.accessSync(componentPicPath)
            fs.unlinkSync(componentPicPath)
        } catch (error) {
            assert.fail('Picture is not copyed to component pic folder correctly')
        }

    }).timeout(10 * 1000)
    it('should add locator and return locator info', async () => {
        let locatorPath = path.join(__dirname, '../../sample-project/recordwright-locator-1.js')
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
    it('should update locator and return null')
    it('should output locator correctly')
})