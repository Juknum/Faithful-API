const success = require('../../../tools/success')
const failed = require('../../../tools/failed')

const express = require('express')
const router = express.Router()

const f = require('../functions/search')
const CRITERIA = ['!=', '==', '>=', '<=', '>', '<', 'includes', 'startsWith', 'endsWith', 'array-contains']

router.get('/:collection/:field/:value/:criteria?', (req, res) => {
  const collection = req.params.collection
  const field = req.params.field
  const value = req.params.value
  const criteria = CRITERIA.includes(req.params.criteria) ? req.params.criteria : 'includes'

  f.search(collection, field, value, criteria)
    .then(success(res))
    .catch(failed(res))
})

router.get('/', (req, res) => {
  const collection = req.query.collection
  const field = req.query.field
  const value = req.query.value
  const criteria = CRITERIA.includes(req.query.criteria) ? req.query.criteria : 'includes'

  f.search(collection, field, value, criteria)
    .then(success(res))
    .catch(failed(res))
})

module.exports = router