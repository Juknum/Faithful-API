const success = require('../../../tools/success')
const failed = require('../../../tools/failed')

const express = require('express')
const router = express.Router()

const f = require('../functions/raw')

router.get('/:collection', (req, res) => {
  const collection = req.params.collection

  f.read_raw(collection)
    .then(success(res))
    .catch(failed(res))
})

module.exports = router