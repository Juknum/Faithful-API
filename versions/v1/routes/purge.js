
const express = require('express')
const success = require('../../../tools/success')
const failed = require('../../../tools/failed')
const router = express.Router()

const p = require('../functions/purge')

/**
 * Purges Cloudflare cache
 */
router.get('/:pass', (req, res) => {
  const password = req.params.pass
  p.purge(password)
    .then(success(res))
    .catch(failed(res))
})

module.exports = router