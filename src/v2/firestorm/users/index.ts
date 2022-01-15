import firestorm from 'firestorm-db';
import { Contributions } from '~/v2/tools/interfaces';
import { contributions } from '..';
import config from '../config';
config();

export default firestorm.collection('users', (el) => {
	el.contributions = async (): Promise<Contributions> => {
		return contributions.search([
			{
				field: 'contributors',
				criteria: 'array-contains',
				value: el[firestorm.ID_FIELD],
			},
		]);
	};

	return el;
});
