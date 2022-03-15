import firestorm from 'firestorm-db';
import config from './config';

config();

export const settings = firestorm.collection('settings');
