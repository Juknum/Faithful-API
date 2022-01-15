import firestorm from 'firestorm-db';
import { parseArr } from '../../tools/parseArr';
import config from '../config';
config();

import uses from './uses';
import { contributions } from '..';
import { Paths, Uses, Contributions, TextureAll } from '~/v2/tools/interfaces';

export default firestorm.collection('textures', (el) => {
	el.uses = async (): Promise<Uses> => {
		return uses.search([
			{
				field: 'textureID', // todo: to be replaced by texture
				criteria: '==',
				value: el[firestorm.ID_FIELD],
			},
		]);
	};

	el.paths = async (): Promise<Paths> => {
		return uses
			.search([
				{
					field: 'textureID', // todo: to be replaced by texture
					criteria: '==',
					value: el[firestorm.ID_FIELD],
				},
			])
			.then((_uses) => {
				return Promise.all(_uses.map((use) => use.paths()));
			})
			.then((arr) => {
				return parseArr(arr);
			});
	};

	el.contributions = async (): Promise<Contributions> => {
		return contributions.search([
			{
				field: 'textureID', // todo: to be replaced by texture
				criteria: '==',
				value: el[firestorm.ID_FIELD],
			},
		]);
	};

	el.all = async (): Promise<TextureAll> => {
		let output = el;
		return el
			.uses()
			.then((uses) => {
				output.uses = uses;
				return el.paths();
			})
			.then((paths) => {
				output.paths = paths;
				return el.contributions();
			})
			.then((contributions) => {
				output.contributions = contributions;
				return output;
			});
	};

	return el;
});
