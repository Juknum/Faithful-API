
import { textures } from '../firestorm';
import { Contributions, Paths, Texture, Textures, TextureAll, Uses } from '../interfaces';
import { mapTexture } from '../tools/mapping/textures';

export default {
  getRaw: function (): Promise<Textures> {
    return textures.read_raw();
  },
  get: function (id: number): Promise<Texture> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Texture IDs are integer greater than 0'))
    return textures.get(id)
      .then(mapTexture); // todo: (DATA 2.0) remove after database rewrite
  },
  getUses: function (id: number): Promise<Uses> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Texture IDs are integer greater than 0'))
    return textures.get(id).then(texture => texture.uses());
  },
  getPaths: function (id: number): Promise<Paths> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Texture IDs are integer greater than 0'))
    return textures.get(id).then(texture => texture.paths());
  },
  getContributions: function (id: number): Promise<Contributions> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Texture IDs are integer greater than 0'))
    return textures.get(id).then(texture => texture.contributions());
  },
  getAll: function (id: number): Promise<TextureAll> {
    if (isNaN(id) || id < 0) return Promise.reject(new Error('Texture IDs are integer greater than 0'))
    return textures.get(id).then(texture => texture.all());
  }

  // todo: implements setter with authentification verification
}