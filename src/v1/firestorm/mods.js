const firestorm = require('firestorm-db')
require('./firestorm_config')()

module.exports = firestorm.collection('mods')