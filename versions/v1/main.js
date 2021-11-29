const path = require('path')
const express = require('express')
const router = express.Router()

const raw = require('./routes/raw')
const texture = require('./routes/texture')
const textures = require('./routes/textures')
const contribution = require('./routes/contribution')
const addon = require('./routes/addon')
const search = require('./routes/search')
const user = require('./routes/user')

router.use('/raw', raw)
router.use('/texture', texture)
router.use('/textures', textures)
router.use('/contribution', contribution)
router.use('/addon', addon)
router.use('/search', search)
router.use('/user', user)

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', '..', '/page.html'))
})

module.exports = router