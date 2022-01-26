const express = require('express')
const success = require('../tools/success')
const failed = require('../tools/failed')
const router = express.Router()

const f = require('../functions/texture')

router.get('/:id', (req, res) => {
  const id = req.params.id

  f.get(id)
    .then(success(res))
    .catch(failed(res))
})

router.get('/:id/:type', (req, res) => {
  const id = req.params.id
  const type = req.params.type

  switch (type) {
    case 'all':
      f.all(id)
        .then(success(res))
        .catch(failed(res))
      break;
    case 'uses':
      f.uses(id)
        .then(success(res))
        .catch(failed(res))
      break;
    case 'paths':
      f.paths(id)
        .then(success(res))
        .catch(failed(res))
      break;
    case 'contributions':
      f.contributions(id)
        .then(success(res))
        .catch(failed(res))
      break;

    default:
      failed(res)('Type is invalid')
      break;
  }
})

module.exports = router