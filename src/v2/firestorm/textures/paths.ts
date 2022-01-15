import firestorm from 'firestorm-db';
import { TextureResponse, UseResponse } from '~/v2/tools/interfaces';
import config from '../config';
config();

import uses from './uses';

export default firestorm.collection('paths', el => {
  el.use = async (): Promise<UseResponse> => {
    return uses.get(el.useID);
  };

  el.texture = (): Promise<TextureResponse> => {
    return new Promise((resolve, reject) => {
      el.use()
        .then(use => {
          return resolve(use.texture())
        })
        .catch(err => {
          reject(err)
        });
    });
  };

  return el;
})