const Locator = require('../../locator-control/class/Locator')
const ElementSelector = require('../../../rwLibrary/class/ElementSelector')
const Coder = require('../../coder/class/AstGenerator')
const AstGenerator = require('../../coder/class/AstGenerator')
class ArgumentNContext {
    /**
     * 
     * @param {*} currentScope 
     * @param {string} argumentStr 
     * @param {*} argDic
     */
    constructor(currentScope, argumentStr, argDic) {
        this.currentScope = currentScope
        this.argumentStr = argumentStr
        this.argDic = argDic
    }
}
class FunctionAST {
    /**
     * 
     * @param {string} path 
     * @param {string} name 
     * @param {string} description 
     * @param {Array<import('./JsDocTag')>} params 
     * @param {Function} mainFunc the main function to call during actual execution
     * @param {import('./JsDocTag')} returnJsDoc
     */
    constructor(path, name, description, params, mainFunc, returnJsDoc) {
        this.path = path
        this.name = name
        this.description = description
        this.params = params
        this.mainFunc = mainFunc
        this.returnJsDoc = returnJsDoc
        /**@type {Object.<string,string>[]} */
        this.defaultGUITag = this.getDefaultGUITag(name)
    }
    static GUI_CATEGORY = {
        Verify: 'Verify',
        InBuiltFunction: 'Run In-built Operation',
        CustomizedOperations: 'Run Customzied Function'
    }
    getDefaultGUITag(name) {
        let defaultTagDict = {
            waitforElement: FunctionAST.GUI_CATEGORY.Verify,
            click: FunctionAST.GUI_CATEGORY.InBuiltFunction,
            gotoFrame: FunctionAST.GUI_CATEGORY.InBuiltFunction,
            bringPageToFront: FunctionAST.GUI_CATEGORY.InBuiltFunction,
            gotoUrl: FunctionAST.GUI_CATEGORY.InBuiltFunction,
            createNewContext: FunctionAST.GUI_CATEGORY.InBuiltFunction,
            change: FunctionAST.GUI_CATEGORY.InBuiltFunction
        }
        let tagInfo = defaultTagDict[name]
        if (tagInfo == null) {
            tagInfo = FunctionAST.GUI_CATEGORY.CustomizedOperations
        }
        return tagInfo
    }
    /**
     * Generate argument string based on the params
     * @param {import('puppeteer-core').Browser} browser 
     * @param {import('puppeteer-core').Page} page 
     * @param {ElementSelector} elementSelector 
     * @param {import('puppeteer-core').Frame} frame 
     * @returns 
     */
    generateArgumentNContext(browser, page, elementSelector, frame) {
        //construct argment for the function
        let currentOperation = this
        let currentScope = {}
        let currentParam = []
        let argDic = {}
        for (let i = 0; i < currentOperation.params.length; i++) {
            let param = currentOperation.params[i]
            //construct scope
            switch (param.type.name) {
                case "VarSaver":
                    currentScope['vars'] = {}
                    currentParam.push('vars')
                    break;
                case "Frame":
                    currentScope['frame'] = frame
                    currentParam.push('frame')
                    break;
                case "Page":
                    currentScope['page'] = page
                    currentParam.push('page')
                    break;
                case "Browser":
                    currentScope['browser'] = browser
                    currentParam.push('browser')
                    break;
                case "ElementSelector":
                    currentParam.push('elementSelector')
                    currentScope['elementSelector'] = elementSelector
                    break;
                case "String":
                    break;
                case "string":
                    currentParam.push(`decodeURIComponent("${encodeURIComponent(param.value)}")`)
                    break;
                case "number":
                    currentParam.push(`${param.value}`)
                    break
                default:
                    break;
            }
            if (param.value && param.value.toLowerCase && param.value.toLowerCase().startsWith('vars:')) {
                currentParam[currentParam.length - 1] = param.value.replace('vars:', 'variable[\'') + '\']'
            }
            argDic[param.description] = param.value
        }

        let argumentStr = currentParam.join(',')
        let result = new ArgumentNContext(currentScope, argumentStr, argDic)
        return result
    }
}
module.exports = FunctionAST