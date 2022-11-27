const AST = require('../../../controller/function-control/function-parser')
const path = require('path')
const fs = require('fs')
const acorn = require("acorn");
const assert = require('assert');
describe('AST class', () => {
    it('should get require inforamtion for default library correctly', async () => {
        let funcPath = path.join(__dirname, '../../sample-project/recordwright-func.js')
        let locatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let astSummary = new AST(locatorPath, funcPath)
        let jsStr = fs.readFileSync(funcPath).toString()
        let ast = acorn.parse(jsStr, { ecmaVersion: 2022 })
        let jsDocSummary = await astSummary.__getRequireInfo(ast, funcPath)
        assert.deepEqual(jsDocSummary.repo.length, 1)
    })

    it('should extract current function library and method name', async () => {
        let funcPath = path.join(__dirname, '../../sample-project/recordwright-func.js')
        let locatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let astSummary = new AST(locatorPath, funcPath)
        let jsStr = fs.readFileSync(funcPath).toString()
        let ast = acorn.parse(jsStr, { ecmaVersion: 2022 })
        let jsDocSummary = await astSummary.__getRwFuncInfoList(funcPath, ast)
        assert.deepEqual(jsDocSummary[0].funcPath, path.resolve(funcPath))
        assert.deepEqual(jsDocSummary[0].methodName, 'click1')
    })
    it('should create function repo with sorted tag info', async () => {
        let funcPath = path.join(__dirname, '../../sample-project/recordwright-func.js')
        let locatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let astSummary = new AST(locatorPath, funcPath)
        await astSummary.loadFunctions(funcPath)
        assert.deepEqual(astSummary.funcRepo[0].name, 'click1')
        assert.deepEqual(astSummary.funcRepo[0].description, 'Click UI Element at against coordaination')
        assert.deepEqual(astSummary.funcRepo[0].params.length, 4)
        assert.deepEqual(astSummary.funcRepo[0].params[0].name, 'frame')
        assert.deepEqual(astSummary.funcRepo[0].params[1].name, 'element')
        assert.deepEqual(astSummary.funcRepo[0].params[2].name, 'x')
        assert.deepEqual(astSummary.funcRepo[0].params[3].name, 'y')
    })
})
