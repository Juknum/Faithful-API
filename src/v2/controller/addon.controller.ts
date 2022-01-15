import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';

import { Addon } from '../tools/interfaces';
// import f from '/src/v1/functions/addon.js';

import { default as version } from '../';
console.log(version);
@Route(`/v2/addons`)
export class AddonController extends Controller {
	@Get('{addonId}')
	public async getUser(@Path() addonId: number): Promise<Addon> {
		return {
			_id: 0,
			authors: [],
			name: 'test',
			description: 'frzsc',
			comments: false,
			slug: 'efjrefj',
		};
	}
}
