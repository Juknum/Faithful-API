const path = require('path')
const express = require('express')
const router = express.Router()

const raw = require('./routes/raw')
const texture = require('./routes/texture')

router.use('/raw', raw)
router.use('/texture', texture)

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', '..', '/page.html'))
})

module.exports = router