require('dotenv').config();
import * as express from "express";
import axios from "axios";
import { PermissionError, NotFoundError, ApiError } from "./ApiError";
import { APIUser } from "discord-api-types";
import { UserService } from "../service/user.service";

const userService = new UserService();

export async function expressAuthentication(
	request: express.Request,
	securityName: string,
	scopes?: string[],
): Promise<string> {

	let token: string;

	if (securityName === "cloudflare") {
		if (request.headers && request.headers.cloudflare)
			token = request.headers.cloudflare as string;
		else return Promise.reject(new Error("Missing access_token in query"));

		if (token === process.env.CLOUDFLARE_PASSWORD) return Promise.resolve('valid cloudflare password');
		return Promise.reject(new Error("Password did not match"))
	}

	else if (securityName === "discord") {
		if (request.headers && request.headers.discord)
			token = request.headers.discord as string;
		else return Promise.reject(new Error("Missing access_token in query"));

		// scopes is roles
		//! question: is everybody considered as Developer ? or only Admins ?
		if (scopes.length) scopes.push("Developer");

		const discordUser: APIUser = await axios
			.get("https://discord.com/api/users/@me", {
				headers: {
					authorization: `Bearer ${token}`,
				},
			})
			.then((response) => response.data)
			.catch((err) => {
				return new ApiError("Discord Error", err.statusCode, err.message);
			});
		if (discordUser instanceof ApiError) throw discordUser;

		let discordID = discordUser.id;

		// if no scopes, go go go
		// but only after discord login
		if (scopes.length == 0) return Promise.resolve(discordID);

		const user: any | undefined = await userService.getUserById(discordID).catch(() => {});

		let roles;
		if (user === undefined) {
			roles = [];
		} else {
			// if cannot find the user, put []
			if (user) roles = user.roles || user.type; // todo: replace by class and getRoles()
			if (!Array.isArray(roles)) {
				console.error(roles);
				roles = [];
			}
		}

		roles = roles.map((e) => e.toLowerCase());
		scopes = scopes.map((e) => e.toLowerCase());

		// check user roles and scopes
		let i = 0;
		while (i < scopes.length) {
			if (roles.includes(scopes[i])) return Promise.resolve(discordID); // return prematurely if has correct role
			i++;
		}

		// if not respected permission error
		console.error(
			"PermissionError on " + discordID + ": " + JSON.stringify(roles) + ", " + JSON.stringify(scopes) + " needed",
		);
		return Promise.reject(new PermissionError());
	}

	return Promise.reject(new NotFoundError("Invalid security name provided"));
}
