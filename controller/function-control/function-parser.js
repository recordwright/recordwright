const fs = require('fs').promises
const acorn = require("acorn");
const walk = require("../common/walkAst")
const extract = require('extract-comments')
const { JsDocSummary, JsDocEntry } = require('./class/JsDocSummary')
const doctrine = require("doctrine");
const path = require('path')
const FunctionAST = require('./class/Function')
const BsFunc = require('./class/BsFunc')
const cliProgress = require('cli-progress');
class AST {
    /**
     * 
     * @param {string} locatorPath the path of the locator summary
     */
    constructor(locatorPath) {
        this.__locatorPath = locatorPath
        /** @type {Array<FunctionAST>} */
        this.__funcRepo = []
        this.__runtimeVariable = {} //this function is used to store runtime variable
    }
    get runtimeVariable() {
        return this.__runtimeVariable
    }
    setRuntimeVariable(name, value) {
        this.__runtimeVariable[name] = value
    }
    /**
     * Push current func ast to the repo
     * @param {FunctionAST} funcAst 
     */
    __addFuncAstToRepo(funcAst) {
        //get rid of function whose id is similar to what we try to add
        this.__funcRepo = this.__funcRepo.filter(item => {
            return item.name != funcAst.name
        })
        this.__funcRepo.push(funcAst)
    }
    get funcRepo() {
        return this.__funcRepo
    }
    /**
     * After function is being used, re-instanize the object to avoid duplication
     * @param {string} name 
     */
    refreshFunction(name) {
        let funcAst = this.getFunction(name)
        this.__funcRepo = this.__funcRepo.filter(item => item.name != name)
        this.__funcRepo.push(funcAst)
    }
    /**
     * Based on the function name, return function ast
     * @param {string} name 
     * @returns {FunctionAST}
     */
    getFunction(name) {
        let func = this.__funcRepo.find(item => {
            return item.name.toUpperCase() == name.toUpperCase()
        })
        if (func == null) {
            return null
        }
        let newFunc = new FunctionAST(func.path, func.name, func.description, [], [], null)
        //clone the object to avoid multiple step refere to the same object
        if (func.mainFunc) {
            newFunc.mainFunc = func.mainFunc
        }
        if (func.locators) {
            newFunc.locators = JSON.parse(JSON.stringify(func.locators))
        }
        if (func.params) {
            newFunc.params = JSON.parse(JSON.stringify(func.params))
        }
        if (func.returnJsDoc) {
            newFunc.returnJsDoc = JSON.parse(JSON.stringify(func.returnJsDoc))
        }
        return newFunc
    }
    /**
     * @param {string} funcPath
     * Based on the bluestone-func.js, parse function information
     * 
     */
    async loadFunctions(funcPath) {
        let jsStr = (await fs.readFile(funcPath)).toString()
        let ast = acorn.parse(jsStr, { ecmaVersion: 2022 })
        //delete cached library and its dependencies
        if (require.cache[funcPath]) {
            require.cache[funcPath].children.forEach(item => {
                delete require.cache[item.id]
            })
        }

        delete require.cache[funcPath]
        let bsFunction = require(funcPath)
        let functionKeys = Object.keys(bsFunction)

        let requireInfo = await this.__getRequireInfo(ast, funcPath)

        const b1 = new cliProgress.SingleBar({
            format: 'Loading ' + funcPath + ' [{bar}] {percentage}% | {value}/{total}'
        }, cliProgress.Presets.shades_classic);

        b1.start(functionKeys.length, 0, {
            speed: "N/A"
        })
        let funcStaicInfoList = await this.__getRwFuncInfoList(funcPath, ast, functionKeys)

        for (let i = 0; i < functionKeys.length; i++) {
            b1.increment()
            let funcName = functionKeys[i]
            //Import recordwright-func.js and get current function name and locator
            let mainFunc = bsFunction[funcName]

            let locators = await bsFunction[funcName]({ getLocator: true })



            //extract static function info for current call
            let funcStaicInfo = funcStaicInfoList[i]
            //Based on the static library and method name, correlate dynamic info
            let methodDetail = requireInfo.repo.find(info => {
                return info.methodName == funcStaicInfo.methodName
            })



            let functionAst = new FunctionAST(funcPath, funcName, methodDetail.methodDescription, methodDetail.jsDocTag, locators, mainFunc, methodDetail.returnJsDoc)
            this.__addFuncAstToRepo(functionAst)



        }
        b1.stop();

    }

    /**
     * From requirement inforamtion, get comments from each function files
     * @param {acorn.Node} ast 
     * @param {string} funcPath
     * @returns {JsDocSummary}
     */
    async __getRequireInfo(ast, funcPath) {
        let result = walk(ast, (node, ancestor) => {
            return (node.type == 'CallExpression') && node.callee.name == 'require' && node.arguments[0].type == 'Literal'
        }, (node, ancestors) => {
            return ancestors.length > 5
        })
        let jsFolder = path.dirname(funcPath)
        let jsDocSummary = new JsDocSummary()
        for (let i = 0; i < result.length; i++) {
            let item = result[i]
            let libraryName = item.ancestors[1].id.name
            let filePath = path.join(jsFolder, item.node.arguments[0].value)
            if (!filePath.toLowerCase().endsWith('.js')) {
                filePath += '.js'
            }
            let funcJs = null
            try {
                funcJs = (await fs.readFile(filePath))
            } catch (error) {
                // in case we cannot find file path (ex: if certain function is coming from bluestone's class, we won't load it)
                continue
            }

            funcJs = funcJs.toString()

            //hanlde legacy function definition pattern
            let commentObj = extract(funcJs, {})
            for (let comment of commentObj) {
                //only worry about the comment for the export function
                if (comment.type != 'BlockComment' || comment.code.context == null || comment.code.context.receiver != 'exports') {
                    continue
                }
                let methodName = comment.code.context.name
                let standardizedCommentStr = comment.value.split("\r\n").join('\n')
                let commentAST = doctrine.parse(standardizedCommentStr, { unwrap: true })

                //rearrange the parameter string so that it will align with the order
                commentAST = this.__extractKeyInputFromObject(comment.code.value, commentAST)


                let methodDescription = commentAST.description

                let jsDocEntry = new JsDocEntry(filePath, libraryName, methodName, methodDescription, commentAST.tags, commentAST['returns'])
                jsDocSummary.add(jsDocEntry)

            }


        }

        //use blue

        return jsDocSummary
    }

    /**
     * Based on playwright-func.js, returns a list of function that is being exported
     * @param {string} funcPath
     * @param {*} ast 
     * @returns {BsFunc[]}
     */
    async __getRwFuncInfoList(funcPath, ast) {
        //extract static function info
        //it seems like there is only 1 object expression. Use that as an indicator
        let currentNodeList = walk(ast, (node, ancestors) => {
            return node.type == 'ObjectExpression'
        }, (node, ancestors, results) => {
            return results.length > 0
        })
        let bsFuncList = []
        for (const currentNode of currentNodeList[0].node.properties) {
            let methodName = currentNode.key.name
            let bsFunc = new BsFunc(funcPath, methodName)
            bsFuncList.push(bsFunc)
        }

        return bsFuncList

    }
    /**
     * Rearrange jsdoc sequence based on function signature. If jsdoc does not allign with number of function signature, return error
     * @param {string} funcSignature 
     * @param {doctrine.Annotation} commentAST
     * @returns {doctrine.Annotation}
     */
    __extractKeyInputFromObject(funcSignature, commentAST) {
        let parameterStr = funcSignature.replace(/.*\(/g, '').replace(/\).*/g, '')
        let parameters = []
        //in case there is , within the function, this indicates that there is no parameter
        if (!funcSignature.includes('()')) {
            parameters = parameterStr.split(',')
        }
        let keyInputVar = []

        let paramTags = commentAST.tags.filter(item => { return item.title == 'param' && !item.name.includes('.') })
        //conduct parameter count check
        if (parameters.length != paramTags.length) {
            throw `number of elements from function: ${funcSignature} does not match number of params in jsDoc.`
        }

        //extract keys from input dictionary
        for (let tag of commentAST.tags) {
            //skip input object
            if (tag.title == 'param' && !tag.name.includes('.')) continue
            tag.name = tag.name.split('.')[1]
            keyInputVar.push(tag)
        }

        //extract returns type
        commentAST['returns'] = commentAST.tags.find(item => item.title == 'returns')

        commentAST.tags = keyInputVar
        return commentAST

    }
}

module.exports = AST