
const FunctionAst = require('../../../../controller/function-control/class/Function')
const rwFunc = require('../../../../rwLibrary/recordwright-func')
const assert = require('assert')
describe('Function Ast', () => {
    it('should classify inbulit function correctly.', async () => {
        // if you forgot to tag inbuilt function
        // 
        let ignoredFunctionNameList = [
            'initialize' //ignore initialize because it's something we do autoamtically. User no need to reinitailzie
        ]

        //populate inbult function name
        let inbuiltFuncNameList = Object.keys(rwFunc)
        let inbuiltCategoryName = []
        Object.keys(FunctionAst.GUI_CATEGORY).forEach(funcName => {
            inbuiltCategoryName.push(FunctionAst.GUI_CATEGORY[funcName])
        })


        for (let funcName of inbuiltFuncNameList) {
            //skip function that is in the ignore list
            if (ignoredFunctionNameList.includes(funcName))
                continue
            let existingFunc = new FunctionAst('', funcName)
            assert.notDeepEqual(existingFunc.defaultGUITag, FunctionAst.GUI_CATEGORY.CustomizedOperations, `Inbuilt Function: "${funcName}" is categorized into wrong category: "${FunctionAst.GUI_CATEGORY.CustomizedOperations}".`)
            assert.ok(inbuiltCategoryName.includes(existingFunc.defaultGUITag, `Function: ${funcName} does not have category secified. Please goto Function.js to update getDefaultGUITag() function`))
        }
    })
    it('should classify customer function into customized function list', async () => {
        let existingFunc = new FunctionAst('', 'click1')
        assert.deepEqual(existingFunc.defaultGUITag, FunctionAst.GUI_CATEGORY.CustomizedOperations, 'Custom function is not labled correctly')
    })
})