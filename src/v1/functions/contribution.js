const { contributions } = require('../firestorm/all')

module.exports = {
  get: function (id) {
    return contributions.get(id)
  }
}