import firestorm from 'firestorm-db';
import { Paths, Texture } from '~/v2/interfaces';
import config from '../config';

import textures from '.';
import paths from './paths';

config();

export default firestorm.collection('uses', (el) => {
	el.texture = (): Promise<Texture> => textures.get(el.textureID);

	el.paths = (): Promise<Paths> => paths.search([
		{
			field: 'useID',
			criteria: '==',
			value: el[firestorm.ID_FIELD],
		},
	]);

	return el;
});
