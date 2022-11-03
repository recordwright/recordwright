var express = require('express');
var router = express.Router();
const config = require('../config')
const path = require('path')
const fs = require('fs').promises
/* GET users listing. */
router.get('/js/:dependency', async function (req, res, next) {
    let filePath = path.join(__dirname, '../controller/browser-control/init-script', req.params.dependency)
    try {
        await fs.access(filePath)
        let fileContent = await fs.readFile(filePath)
        let fileStr = fileContent.toString()
        res.type('.js')
        res.send(fileStr);
    } catch (error) {
        return res.json(404)
    }
});

module.exports = router;
