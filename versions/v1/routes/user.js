const express = require('express')
const success = require('../../../tools/success')
const failed = require('../../../tools/failed')
const router = express.Router()

const f = require('../functions/user')

router.get('/:id', (req, res) => {
  const id = req.params.id

  f.get(id)
    .then(success(res))
    .catch(failed(res))
})

module.exports = router