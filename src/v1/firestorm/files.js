const firestorm = require('firestorm-db')
require('./firestorm_config')()

/**
 * @typedef {Object} File
 */

module.exports = firestorm.collection('files')