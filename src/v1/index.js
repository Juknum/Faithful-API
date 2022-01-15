import { Route } from 'tsoa'

const express = require('express')

const raw = require('./routes/raw')
const texture = require('./routes/texture')
const textures = require('./routes/textures')
const contribution = require('./routes/contribution')
const addon = require('./routes/addon')
const search = require('./routes/search')
const user = require('./routes/user')
const purge = require('./routes/purge')
@Route('v1')
export default class V1 {
  router = express.Router()
  V1() {
    router.use('/raw', raw)
    router.use('/texture', texture)
    router.use('/textures', textures)
    router.use('/contribution', contribution)
    router.use('/addon', addon)
    router.use('/search', search)
    router.use('/user', user)
    router.use('/purge', purge)
  }
}