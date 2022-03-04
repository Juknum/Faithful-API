import { CloudflareRepository } from '../interfaces/cloudflare';

require('dotenv').config();

export default class CloudflareClassRepository implements CloudflareRepository {
  private readonly cf = require('cloudflare')({
    token: process.env.CLOUDFLARE_KEY,
  });

  purge(): Promise<any> {
    // https://cloudflare.github.io/node-cloudflare/#zonesbrowse
    // https://api.cloudflare.com/#zone-list-zones
    // permission needed: #zone:read
    return this.cf.zones.browse()
      .then((res) =>
        // https://cloudflare.github.io/node-cloudflare/#zonespurgecache
        // https://api.cloudflare.com/#zone-purge-all-files
        // permission needed: #cache_purge:edit
        Promise.all(res.result
          .map((e) => e.id)
          .map((id) => this.cf.zones.purgeCache(
            id,
            {
              purge_everything: true,
            },
          ))))
      .then((response) => {
        if (Array.isArray(response)) {
          response.forEach((zone) => {
            delete zone.result;
          });
        }

        return Promise.resolve(response);
      });
  }
}
