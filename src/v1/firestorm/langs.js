const firestorm = require('firestorm-db')
require('./firestorm_config')()

/**
 * @typedef {Object} Langs
 */

module.exports = firestorm.collection('langs')