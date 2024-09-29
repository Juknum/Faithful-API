import "dotenv/config";

import { Request as ExRequest } from "express";
import axios from "axios";
import { APIUser } from "discord-api-types/v10";
import { PermissionError, NotFoundError, APIError, ForbiddenError } from "./errors";
import UserService from "../service/user.service";
import AddonService from "../service/addon.service";
import { Addon } from "../interfaces";
import { AddonStatusNotApproved, AddonStatusValues } from "../interfaces/addons";

const userService = new UserService();
const addonService = new AddonService();

export async function expressAuthentication(
	request: ExRequest,
	securityName: string,
	scopes?: string[],
): Promise<any> {
	let token: string;
	scopes ||= [];

	// if there is no auth (no discord header)
	// but if we want access with no auth for approved only
	if (scopes.includes("addon:approved")) {
		if ("id_or_slug" in request.params) {
			// if not authentified
			if (!request.headers.discord && !request.query.discord) {
				// not authed
				// is not an addon status (is id/slug of addon)
				if (!AddonStatusValues.includes(request.params.id_or_slug as any)) {
					const addon = (await addonService.getAddonFromSlugOrId(request.params.id_or_slug))[1];
					if (addon.approval.status !== "approved") return Promise.reject(new ForbiddenError());

					//* not authed, not a status, is an id/slug
					return Promise.resolve(undefined);
				}

				// if addon status & not approved status
				if (AddonStatusNotApproved.includes(request.params.id_or_slug as any))
					return Promise.reject(new ForbiddenError());
			}

			// may be authed
			// if you are looking at a status
			if (
				AddonStatusValues.includes(request.params.id_or_slug as any) &&
				!AddonStatusNotApproved.includes(request.params.id_or_slug as any)
			)
				return Promise.resolve(undefined);
		}
	}

	switch (securityName) {
		case "bot":
			if (request.headers?.bot) token = request.headers.bot as string;
			else return Promise.reject(new Error("Missing bot token in header"));

			if (token === process.env.BOT_PASSWORD) return Promise.resolve("Valid bot password");
			return Promise.reject(new Error("Password did not match"));
		case "cloudflare":
			if (request.headers?.cloudflare) token = request.headers.cloudflare as string;
			else return Promise.reject(new Error("Missing cloudflare token in header"));

			if (token === process.env.CLOUDFLARE_PASSWORD)
				return Promise.resolve("Valid cloudflare password");
			return Promise.reject(new Error("Password did not match"));
		// curly brackets used to fix scoping issues
		case "discord": {
			if (request.query && request.query.discord) token = request.query.discord as string;
			else if (request.headers && request.headers.discord)
				token = request.headers.discord as string;
			else return Promise.reject(new Error("Missing discord token in header"));

			const discordUser: APIUser = await axios
				.get("https://discord.com/api/users/@me", {
					headers: {
						authorization: `Bearer ${token}`,
					},
				})
				.then((response) => response.data)
				.catch(
					(err) =>
						new APIError(
							"Discord Error",
							err?.response?.status,
							err?.response?.data?.message || err.message,
						),
				);
			if (discordUser instanceof APIError) return Promise.reject(discordUser);

			// proven (authentified)

			const discordID: string = discordUser.id;

			// if no scopes, go go go
			// but only after discord login
			if (scopes.length === 0) return Promise.resolve(discordID);

			// resolve whole user object
			if (scopes.includes("account:create")) return Promise.resolve(discordUser);

			if (scopes.includes("account:delete")) {
				const { id } = request.params;
				// make sure id in request and params match
				if (discordUser.id === id) return Promise.resolve(discordUser.id);
			}

			if (
				(scopes.includes("addon:approved") || scopes.includes("addon:own")) &&
				"id_or_slug" in request.params
			) {
				const { id_or_slug: idOrSlug } = request.params;
				if ((AddonStatusValues as ReadonlyArray<string>).includes(idOrSlug)) {
					if (!(AddonStatusNotApproved as ReadonlyArray<string>).includes(idOrSlug))
						return Promise.resolve(discordID);
					//* check if D: admin or roles, uses the rest of authentication with roles
				} else {
					const addon: Addon = (await addonService.getAddonFromSlugOrId(idOrSlug))[1];

					// check if C: author
					if (addon.authors.includes(discordID)) return Promise.resolve(discordID);
					//* else if not author check if D: admin or roles, uses the rest of authentication with roles
				}
			}

			// scopes is roles
			// adding devs role when developing stuff only
			if (scopes.length && process.env.DEV.toLowerCase() === "true") scopes.push("Developer");

			const user = await userService.getUserById(discordID).catch(() => {});

			let roles: string[] = user ? user.roles : [];
			if (!Array.isArray(roles)) roles = [];

			roles = roles.map((e) => e.toLowerCase());
			scopes = scopes.map((e) => e.toLowerCase());

			// return prematurely if has correct role
			if (scopes.some((scope) => roles.includes(scope))) return Promise.resolve(discordID);

			// if not respected permission error
			console.error(
				`PermissionError on ${discordID}: ${JSON.stringify(roles)}, ${JSON.stringify(scopes)} needed`,
			);

			if (scopes.includes("addon:approved") && !("id_or_slug" in request.params))
				return Promise.resolve(undefined);

			return Promise.reject(new PermissionError());
		}
		default:
			return Promise.reject(new NotFoundError("Invalid security name provided"));
	}
}
