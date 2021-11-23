const { textures, contributions } = require('../../../firestorm/all')
const parseArr = require('../../../tools/parseArr')

module.exports = {
  get: function (id) {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Texture IDs are integer greater than 0'))
    return textures.get(id)
  },
  uses: function (id, parsed = true) {
    return this.get(id)
      .then(texture => {
        return texture.uses()
      })
      .then(uses => {
        if (!parsed) return uses
        return parseArr(uses)
      })
  },
  paths: function (id) {
    return this.uses(id, false)
      .then(uses => {
        return Promise.all(uses.map(use => use.paths()))
      })
      .then(array_of_paths => {
        return parseArr(array_of_paths.map(el => parseArr(el)))
      })
  },
  contributions: function (id) {
    return contributions.search([{
      field: 'textureID',
      criteria: '==',
      value: id
    }])
      .then(contributions => {
        return parseArr(contributions)
      })
  },
  all: function (id) {
    let output

    return this.get(id)
      .then(texture => {
        output = texture
        return this.uses(id)
      })
      .then(uses => {
        output.uses = uses
        return this.paths(id)
      })
      .then(paths => {
        output.paths = paths
        return this.contributions(id)
      })
      .then(contributions => {
        output.contributions = contributions
        return output
      })
  }
}