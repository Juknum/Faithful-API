const firestorm = require('firestorm-db')
const texture = require('./textures')
const users = require('./users')

require('./firestorm_config')()

/**
 * @typedef {Object} Contribution
 * @property {String} date date of contribution
 * @property {Number} textureID texture's id modified
 * @property {String[]} contributors authors of the contribution
 * @property {String} res res of contribution (compliance_32, compliance_c64)
 * @property {Function} getContributors users associated to this contribution
 * @property {Function} texture texture associated to this contribution
 */

module.exports = firestorm.collection('contributions', el => {
  /** @returns {Promise<import('./textures').Texture>} */
  el.getContributors = function () {
    return users.searchKeys(el.contributors || [])
  }

  /** @returns {Promise<import('./textures').Texture>} */
  el.texture = function () {
    return texture.get(el.textureID)
  }

  return el
})