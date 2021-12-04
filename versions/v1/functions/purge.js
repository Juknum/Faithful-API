require('dotenv').config()
const axios = require('axios')

/** @type {import('cloudflare')} cf */
const cf = require('cloudflare')({
  token: process.env.CLOUDFLARE_KEY
});

module.exports = {
  purge: function (password) {
    if(password != process.env.PURGE_PASSWORD) return Promise.reject(new Error('Incorrect purge password'))

    // https://cloudflare.github.io/node-cloudflare/#zonesbrowse
    // https://api.cloudflare.com/#zone-list-zones
    // permission needed: #zone:read
    return cf.zones.browse()
    .then(res => {
      // https://cloudflare.github.io/node-cloudflare/#zonespurgecache
      // https://api.cloudflare.com/#zone-purge-all-files
      // permission needed: #cache_purge:edit
      const purgePromises = res.result.map(e => e.id).map(id => cf.zones.purgeCache(id, {
        purge_everything: true
      }))

      return Promise.all(purgePromises)
    })
    .then(response => {
      if(Array.isArray(response)) {
        response.forEach(zone => {
          delete zone.result
        })
      }
      return Promise.resolve(response)
    })
    .catch(err => {
      if(err && err.response && err.response.body && err.response.body.errors) {
        err = err.response.body.errors
      }
      return Promise.reject(err)
    })
  }
}