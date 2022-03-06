import firestorm from 'firestorm-db';
import { Contributions, Addons } from '~/v2/interfaces';
import { contributions } from '..';
import addons from '../addons';
import config from '../config';

config();

export default firestorm.collection('users', (el) => {
	el.contributions = async (): Promise<Contributions> => contributions.search([
		{
			field: 'contributors',
			criteria: 'array-contains',
			value: el[firestorm.ID_FIELD],
		},
	]);

	el.addons = async (): Promise<Addons> => addons.search([
		{
			field: 'authors',
			criteria: 'array-contains',
			value: el[firestorm.ID_FIELD],
		},
	]);

	return el;
});
