const { users } = require('../../../firestorm/all')
const parseArr = require('../../../tools/parseArr')

module.exports = {
  get: function (id) {
    return users.get(id)
  }
}