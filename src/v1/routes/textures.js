const express = require('express')
const success = require('../tools/success')
const failed = require('../tools/failed')
const router = express.Router()

const f = require('../functions/textures')

const split = (str) => {
  return str.includes(',') ? str.split(',') : [str]
}

router.get('/:id', (req, res) => {
  const ids = split(req.params.id)

  f.get(ids)
    .then(success(res))
    .catch(failed(res))
})
router.get('/:id/:type', (req, res) => {
  const ids = split(req.params.id)
  const type = req.params.type

  switch (type) {
    case 'all':
      f.all(ids)
        .then(success(res))
        .catch(failed(res))
      break;
    case 'uses':
      f.uses(ids)
        .then(success(res))
        .catch(failed(res))
      break;
    case 'paths':
      f.paths(ids)
        .then(success(res))
        .catch(failed(res))
      break;
    case 'contributions':
      f.contributions(ids)
        .then(success(res))
        .catch(failed(res))
      break;

    default:
      return failed(res)('Type is invalid')
  }
})

module.exports = router