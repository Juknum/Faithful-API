import { addons, files } from '../../v1/firestorm/all'
const parseArr = require('../tools/parseArr')
import { Addon, AddonAll, AddonFiles } from '../tools/interfaces';

export default {
  get: function (id: number): Promise<Addon> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Addons IDs are integer greater than 0'))
    return addons.get(id)
  },
  files: function (id: number): Promise<AddonFiles> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Addons IDs are integer greater than 0'))
    return files.search([{
      field: 'parent.type',
      criteria: '==',
      value: 'addons'
    }, {
      field: 'parent.id',
      criteria: '==',
      value: id
    }])
  },
  all: function (id: number): Promise<AddonAll> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Addons IDs are integer greater than 0'))
    let output

    return this.get(id)
      .then(addon => {
        output = addon
        return this.files(id)
      })
      .then(files => {
        output.files = files
        return output
      })
  }
}