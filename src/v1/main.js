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
const purge = require('./routes/purge')

router.use('/raw', raw)
router.use('/texture', texture)
router.use('/textures', textures)
router.use('/contribution', contribution)
router.use('/addon', addon)
router.use('/search', search)
router.use('/user', user)
router.use('/purge', purge)

// const sentFiles = {
//   '/': 'page.html',
//   '/page.css': 'page.css',
//   'page.js': 'page.js'
// }

// Object.keys(sentFiles).forEach(route => {
//   router.get(route, function (req, res) {
//     res.sendFile(path.join(__dirname, '..', '..', sentFiles[route]))
//   })
// })

module.exports = router