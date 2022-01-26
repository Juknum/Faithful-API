const firestorm = require('firestorm-db')
require('./firestorm_config')()

/**
 * @typedef {Object} Settings
 */

module.exports = firestorm.collection('settings')