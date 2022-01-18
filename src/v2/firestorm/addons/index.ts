import firestorm from 'firestorm-db';
import { AddonAll, Files } from '~/v2/interfaces';
import config from '../config';
import files from '../files';
config();

export default firestorm.collection('addons', (el) => {
  el.files = (): Promise<Files> => {
    return files.search([
      {
        field: "parent.id",
        criteria: '==',
        value: el[firestorm.ID_FIELD]
      },
      {
        field: "parent.type",
        criteria: '==',
        value: 'addons'
      }
    ])
  }

  el.all = (): Promise<AddonAll> => {
    let output = el;
    return el.files()
      .then(res => {
        output.files = res;
        return output;
      })
  }

  return el;
})