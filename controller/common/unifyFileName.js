/**
 * Get valid file name for windows directory 
 * @param {string} fileName 
 */
module.exports = function (fileName) {
    //clean up unsupported name
    let forbiddenCharInFileName = ['/', "<", ">", "*", ":", '"', "\\", "/", "|", "?", "*"]
    let cleanedName = fileName
    forbiddenCharInFileName.forEach(item => {
        cleanedName = cleanedName.split(item).join('')
    })
    return cleanedName
}