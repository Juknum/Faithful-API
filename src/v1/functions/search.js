const all = require('../firestorm/all')

module.exports = {
  search: (collection, field, value, criteria = 'includes') => {
    if (!all[collection]) return Promise.reject(new Error('This data collection does not exist'))
    if (!field) return Promise.reject(new Error('Field option is required!'))
    if (!value) return Promise.reject(new Error('Value option is required!'))

    return all[collection].search([{
      field: field,
      criteria: criteria,
      value: value
    }])

  }
}