import firestorm from 'firestorm-db';
import { Texture, Use } from '~/v2/interfaces';
import config from '../config';

import uses from './uses';

config();

export default firestorm.collection('paths', (el) => {
  el.use = async (): Promise<Use> => uses.get(el.useID);

  el.texture = (): Promise<Texture> => new Promise((resolve, reject) => {
    el.use()
      .then((use) => resolve(use.texture()))
      .catch((err) => {
        reject(err);
      });
  });

  return el;
});
