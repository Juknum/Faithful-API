import firestorm from 'firestorm-db';
import config from '../config';
config();

export default firestorm.collection('files', (el) => {
  return el;
})