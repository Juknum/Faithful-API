const express = require('express')
const router = express.Router()

const raw = require('./routes/raw')
const texture = require('./routes/texture')

router.use('/raw', raw)
router.use('/texture', texture)

router.get('/', (req, res) => {
  res.send('First version of that API! started support as of 22 November 2021')
})

module.exports = router