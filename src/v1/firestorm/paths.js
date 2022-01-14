const firestorm = require('firestorm-db')
require('./firestorm_config')()

/**
 * @typedef {Object} TexturePath
 * @property {Number} useID // use id of this path
 * @property {String} path // path itself
 * @property {String[]} versions // minecraft versions (any edition)
 * @property {Function} use // get the use from the path
 * @property {Function} texture // get the texture from the path
 */

module.exports = firestorm.collection('paths', el => {
  /** @returns {Promise<import('./uses').TextureUse>} */
  el.use = function () {
    const texture_use = require('./uses')

    return texture_use.get(el.useID)
  }

  /** @returns {Promise<import('./textures').Texture>} */
  el.texture = function () {
    return new Promise((resolve, reject) => {
      el.use()
        .then(use => {
          return resolve(use.texture())
        })
        .catch(err => {
          reject(err)
        })
    })

  }
  return el
})