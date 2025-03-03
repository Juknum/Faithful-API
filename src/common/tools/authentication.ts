import "dotenv/config";

import { Request as ExRequest } from "express";
import axios from "axios";
import { APIUser } from "discord-api-types/v10";
import UserService from "@v2/service/user.service";
import AddonService from "@v2/service/addon.service";
import PostService from "@v2/service/post.service";
import { Addon } from "@v2/interfaces";
import { AddonStatusApproved, AddonStatusValues } from "@v2/interfaces/addons";

import { PermissionError, NotFoundError, APIError } from "./errors";

const userService = new UserService();
const addonService = new AddonService();
const postService = new PostService();

const isSlug = (idOrSlug: string): boolean => !AddonStatusValues.includes(idOrSlug as any);
function getRequestKey({ headers, query }: ExRequest, key: string, queryAllowed = false): string {
	if (!headers && !query) return null;
	if (headers[key]) return headers[key] as string;
	if (queryAllowed && query[key]) return query[key] as string;
	return null;
}

// https://tsoa-community.github.io/docs/authentication.html
export async function expressAuthentication(
	request: ExRequest,
	securityName: string,
	scopes?: string[],
): Promise<any> {
	scopes ||= [];

	// handle public add-ons/posts without a token (for website etc)
	if ("id_or_slug" in request.params) {
		if (scopes.includes("addon:approved")) {
			// /v2/addons/approved is public, safe to send
			if (request.params.id_or_slug === AddonStatusApproved) return true;

			// it's an addon slug and not a status
			if (isSlug(request.params.id_or_slug)) {
				const addon = (await addonService.getAddonFromSlugOrId(request.params.id_or_slug))[1];
				if (addon.approval.status === AddonStatusApproved) return true;
			}
		}
		if (scopes.includes("post:approved")) {
			if (request.params.id_or_slug === "approved") return true;
			const post = await postService.getByIdOrPermalink(request.params.id_or_slug);
			if (post.published === true) return true;
		}
	}

	// securityName will hit the default switch state if it doesn't exist so it's fine here
	const token = getRequestKey(request, securityName, securityName === "discord");

	switch (securityName) {
		case "bot":
			if (!token) throw new Error("Missing bot token in header");
			if (token === process.env.BOT_PASSWORD) return "Valid bot password";
			throw new Error("Password did not match");
		case "cloudflare":
			if (!token) throw new Error("Missing CloudFlare token in header");
			if (token === process.env.CLOUDFLARE_PASSWORD) return "Valid CloudFlare password";
			throw new Error("Password did not match");
		// curly brackets used to fix scoping issues
		case "discord": {
			if (!token) throw new Error("Missing Discord token in header");

			let discordUser: APIUser;
			try {
				discordUser = await axios
					.get("https://discord.com/api/users/@me", {
						headers: {
							authorization: `Bearer ${token}`,
						},
					})
					.then((response) => response.data);
			} catch (err) {
				// re-throw with better details (axios stack traces suck)
				throw new APIError(
					"Discord Error",
					err?.response?.status,
					err?.response?.data?.message || err.message,
				);
			}

			// proven (authentified)
			const discordID = discordUser.id;

			// only scope is login required, good to go
			if (!scopes.length) return discordID;

			// resolve whole user object (needed for user init)
			if (scopes.includes("account:create")) return discordUser;
			if (scopes.includes("account:delete")) {
				// make sure id in request and params match
				if (discordID === request.params.id) return discordID;
				// continue to role check (admins can delete accounts too)
			}

			// check add-on ownership
			if (scopes.includes("addon:own") || scopes.includes("addon:approved")) {
				const idOrSlug = request.params.id_or_slug;
				if (isSlug(idOrSlug)) {
					const addon: Addon = (await addonService.getAddonFromSlugOrId(idOrSlug))[1];
					if (addon.authors.includes(discordID)) return discordID;
				}
				// if it's a status continue to role checks
			}

			// scopes are roles
			// add dev role when developing stuff only
			if (scopes.length && process.env.DEV.toLowerCase() === "true") scopes.push("Developer");

			const user = await userService.getUserById(discordID).catch<null>(() => null);

			let roles: string[] = user?.roles || [];
			if (!Array.isArray(roles)) roles = [];

			roles = roles.map((e) => e.toLowerCase());
			scopes = scopes.map((e) => e.toLowerCase());

			// resolve if role matches
			if (scopes.some((scope) => roles.includes(scope))) return discordID;

			// otherwise throw permission error
			console.error(
				`PermissionError with ${discordID}: ${JSON.stringify(roles)}, ${JSON.stringify(scopes)} needed`,
			);

			if (scopes.includes("addon:approved") && !("id_or_slug" in request.params)) return undefined;
			throw new PermissionError();
		}
		default:
			throw new NotFoundError("Invalid security name provided");
	}
}

// saves some type gymnastics to be able to declare it at once
export interface ExRequestWithAuth<T> extends ExRequest {
	user: T;
}
