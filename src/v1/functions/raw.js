const all = require('../firestorm/all')

module.exports = {
  read_raw: (collection) => {
    if (!all[collection]) return Promise.reject(new Error('This data collection does not exist'))

    return all[collection].read_raw()
  }
}