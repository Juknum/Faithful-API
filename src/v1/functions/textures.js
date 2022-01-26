const texture = require('./texture')

module.exports = {
  get: function (ids) {
    ids = ids.sort((a, b) => { return a - b })
    return Promise.all(ids.map(id => texture.get(id)))
  },
  uses: function (ids) {
    ids = ids.sort((a, b) => { return a - b })
    return Promise.all(ids.map(id => texture.uses(id)))
  },
  paths: function (ids) {
    ids = ids.sort((a, b) => { return a - b })
    return Promise.all(ids.map(id => texture.paths(id)))
  },
  contributions: function (ids) {
    ids = ids.sort((a, b) => { return a - b })
    return Promise.all(ids.map(id => texture.contributions(id)))
  },
  all: function (ids) {
    ids = ids.sort((a, b) => { return a - b })
    return Promise.all(ids.map(id => texture.all(id)))
  }
}