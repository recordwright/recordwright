var express = require('express');
var router = express.Router();
const config = require('../config')
const path = require('path')
const fs = require('fs').promises
/* GET users listing. */
router.get('/isReady', async function (req, res, next) {
    /**@type {import('../controller/record-manager')} */
    let recordManager = req.recordManager
    try {
        await recordManager.waitForInit()
    } catch (error) {
        res.status(500).json(error)
    }

    res.status(200)
});

module.exports = router;
