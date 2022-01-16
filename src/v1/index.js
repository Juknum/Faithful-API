const express = require('express')

const raw = require('./routes/raw')
const texture = require('./routes/texture')
const textures = require('./routes/textures')
const contribution = require('./routes/contribution')
const addon = require('./routes/addon')
const search = require('./routes/search')
const user = require('./routes/user')
const purge = require('./routes/purge')

const router = express.Router()
router.use('/raw', raw)
router.use('/texture', texture)
router.use('/textures', textures)
router.use('/contribution', contribution)
router.use('/addon', addon)
router.use('/search', search)
router.use('/user', user)
router.use('/purge', purge)

module.exports = router;