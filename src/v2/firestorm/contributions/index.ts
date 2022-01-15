import firestorm from 'firestorm-db';
import { TextureResponse, UserResponse } from '~/v2/tools/interfaces';
import { users } from '..';
import config from '../config';
import textures from '../textures';
config();

export default firestorm.collection('contributions', el => {
  el.getContributors = (): Promise<UserResponse> => {
    return users.searchKeys(el.contributors || []);
  };

  el.texture = (): Promise<TextureResponse> => {
    return textures.get(el.textureID); // todo to be replaced by texture
  };

  return el;
})