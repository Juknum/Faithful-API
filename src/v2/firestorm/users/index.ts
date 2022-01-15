import firestorm from 'firestorm-db';
import { ContributionsResponse } from '~/v2/tools/interfaces';
import { contributions } from '..';
import config from '../config';
config();

export default firestorm.collection('users', el => {
  el.contrbutions = async (): Promise<ContributionsResponse> => {
    return contributions.search([{
      field: 'contributors',
      criteria: 'array-contains',
      value: el[firestorm.ID_FIELD]
    }])
  };

  return el;
})