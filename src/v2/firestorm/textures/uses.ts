import firestorm from 'firestorm-db';
import config from '../config';
config();

import textures from '.';
import paths from './paths';
import { PathsResponse, TextureResponse } from '~/v2/tools/interfaces';

export default firestorm.collection('uses', el => {
  el.texture = (): Promise<TextureResponse> => {
    return textures.get(el.textureID);
  };

  el.paths = (): Promise<PathsResponse> => {
    return paths.search([{
      field: 'useID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }]);
  };

  return el;
})