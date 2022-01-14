require('dotenv').config()
const firestorm = require('firestorm-db')

module.exports = function () {
  firestorm.address(process.env.FIRESTORM_URL)
  firestorm.token(process.env.FIRESTORM_TOKEN)
}