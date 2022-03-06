import * as express from 'express';
import axios from 'axios';
import { APIUser } from 'discord-api-types/v9';
import { PermissionError, NotFoundError, ApiError, ForbiddenError } from './ApiError';
import { UserService } from '../service/user.service';
import AddonService from '../service/addon.service';
import { Addon } from '../interfaces';
import { AddonNotApprovedValues, AddonStatusValues } from '../interfaces/addons';

require('dotenv').config();

const userService = new UserService();
const addonService = new AddonService();

/* eslint-disable import/prefer-default-export */
export async function expressAuthentication(
	request: express.Request,
	securityName: string,
	scopes?: string[],
): Promise<any> {
	let token: string;

	// if there is no auth (no discord header)
	// but if we want access with no auth for approved only
	if (scopes.includes('addon:approved')) {
		if ('id_or_slug' in request.params) {
			// if not authentified
			if (!request.headers.discord && !request.query.discord) {
				// not authed
				// is not an addon status (is id/slug of addon)
				if (!AddonStatusValues.includes(request.params.id_or_slug as any)) {
					const addon = (await addonService.getAddonFromSlugOrId(request.params.id_or_slug))[1];
					if (addon.approval.status !== 'approved') return Promise.reject(new ForbiddenError());

					//* not authed, not a status, is an id/slug
					return Promise.resolve(undefined);
				}

				// if addon status & not approved status
				if (AddonNotApprovedValues.includes(request.params.id_or_slug as any))
					return Promise.reject(new ForbiddenError());
			}

			// may be authed
			// if you are looking at a status
			if (
				AddonStatusValues.includes(request.params.id_or_slug as any) &&
				!AddonNotApprovedValues.includes(request.params.id_or_slug as any)
			)
				return Promise.resolve(undefined);
		}
	}

	if (securityName === 'bot') {
		if (request.headers && request.headers.bot) token = request.headers.bot as string;
		else return Promise.reject(new Error('Missing bot token in header'));

		if (token === process.env.BOT_PASSWORD) return Promise.resolve('Valid bot password');
		return Promise.reject(new Error('Password did not match'));
	}
	if (securityName === 'cloudflare') {
		if (request.headers && request.headers.cloudflare) token = request.headers.cloudflare as string;
		else return Promise.reject(new Error('Missing cloudflare token in header'));

		if (token === process.env.CLOUDFLARE_PASSWORD) return Promise.resolve('Valid cloudflare password');
		return Promise.reject(new Error('Password did not match'));
	}
	if (securityName === 'discord') {
		if (request.query && request.query.discord) token = request.query.discord as string;
		else if (request.headers && request.headers.discord) token = request.headers.discord as string;
		else return Promise.reject(new Error('Missing discord token in header'));

		const discordUser: APIUser = await axios
			.get('https://discord.com/api/users/@me', {
				headers: {
					authorization: `Bearer ${token}`,
				},
			})
			.then((response) => response.data)
			.catch((err) => new ApiError('Discord Error', err.statusCode, err.message));
		if (discordUser instanceof ApiError) return Promise.reject(discordUser);

		// B proven (authentified)

		const discordID: string = discordUser.id;

		// if no scopes, go go go
		// but only after discord login
		if (scopes.length === 0) return Promise.resolve(discordID);

		if ((scopes.includes('addon:approved') || scopes.includes('addon:own')) && 'id_or_slug' in request.params) {
			const { id_or_slug: idOrSlug } = request.params;
			if ((AddonStatusValues as ReadonlyArray<string>).includes(idOrSlug)) {
				if (!(AddonNotApprovedValues as ReadonlyArray<string>).includes(idOrSlug))
					return Promise.resolve(discordID);
				//* check if D: admin or roles, uses the rest of authentification with roles
			} else {
				const addon: Addon = (await addonService.getAddonFromSlugOrId(idOrSlug))[1];

				// check if C: author
				if (addon.authors.includes(discordID)) return discordID;
				//* else if not author check if D: admin or roles, uses the rest of authentification with roles
			}
		}

		// scopes is roles
		// adding devs role when developing stuff only
		if (scopes.length && process.env.DEV.toLowerCase() === 'true') scopes.push('Developer');

		const user: any | undefined = await userService.getUserById(discordID).catch(() => {});

		let roles;
		if (user === undefined) {
			roles = [];
		} else {
			// if cannot find the user, put []
			if (user) roles = user.roles || user.type; // todo: replace by class and getRoles()
			if (!Array.isArray(roles)) {
				roles = [];
			}
		}

		roles = roles.map((e) => e.toLowerCase());
		scopes = scopes.map((e) => e.toLowerCase()); // eslint-disable-line no-param-reassign

		// check user roles and scopes
		let i = 0;
		while (i < scopes.length) {
			if (roles.includes(scopes[i])) return Promise.resolve(discordID); // return prematurely if has correct role
			i += 1;
		}

		// if not respected permission error
		console.error(`PermissionError on ${discordID}: ${JSON.stringify(roles)}, ${JSON.stringify(scopes)} needed`);

		if (scopes.includes('addon:approved') && !('id_or_slug' in request.params)) {
			return Promise.resolve(undefined);
		}
		return Promise.reject(new PermissionError());
	}

	return Promise.reject(new NotFoundError('Invalid security name provided'));
}
