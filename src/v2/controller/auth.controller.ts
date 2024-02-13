import express from "express";
import { Body, Controller, Get, Path, Post, Query, Request, Route, Tags } from "tsoa";

// REDIRECT URL IS '<origin>/auth/<provider>/callback'
const REDIRECT_URI_PATHNAME = "/callback";
// example with discord provider:
// REDIRECT URL IS '<origin>/auth/discord/callback'

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
	private rawTargetToURL(target: string) {
		if (target === "webapp") return process.env.WEBAPP_URL;
		return "";
	}

	private targetToURL(target: string) {
		return this.rawTargetToURL(target).replace(/\/$/, "");
	}

	private shapeRedirectURI(request: express.Request) {
		const api_origin = `${request.protocol}://${request.headers.host}`;
		const request_path = request.path;
		const path_split = request_path.split("/");
		path_split.pop(); // remove target
		return api_origin.replace(/\/$/, "") + path_split.join("/") + REDIRECT_URI_PATHNAME;
	}

	/**
	 * Handles Discord authorization page redirect
	 */
	@Get("discord/callback")
	public async discordAuthCallback(
		@Query() code: string,
		@Query() state: string,
		@Request() request: express.Request,
	) {
		const params = new URLSearchParams();
		params.append("client_id", process.env.DISCORD_CLIENT_ID);
		params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
		params.append("grant_type", "authorization_code");
		params.append("code", code);
		params.append("redirect_uri", process.env.REDIRECT_DOMAIN.replace(/\/$/, "") + request.path);
		params.append("scope", "identify");

		const res = (<any>request).res as express.Response;
		const token_response = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			body: params,
		});
		const json: any = await token_response.json();

		if ("error" in json) {
			res.status(500).json(json).end();
			return;
		}

		res.redirect(
			`${this.targetToURL(state)}/?access_token=${encodeURIComponent(json.access_token)}&refresh_token=${encodeURIComponent(
				json.refresh_token,
			)}&expires_in=${encodeURIComponent(json.expires_in)}`,
		);
	}

	/**
	 * Handles Discord refresh for new sessions
	 */
	@Post("discord/refresh")
	public async discordAuthRefresh(
		@Body() refresh_token: string,
		@Request() request: express.Request,
	) {
		const params = new URLSearchParams();
		params.append("client_id", process.env.DISCORD_CLIENT_ID);
		params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
		params.append("grant_type", "refresh_token");
		params.append("refresh_token", refresh_token);

		const res = (<any>request).res as express.Response;
		const token_response = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			body: params,
		});
		const json: any = await token_response.json();

		if ("error" in json) {
			res.status(500).json(json).end();
			return;
		}

		res.json(json).end();
	}

	/**
	 * Redirects to Discord oauth2 authorization page
	 * @param target Redirect target app
	 */
	@Get("discord/{target}")
	public discordAuthGrant(@Path() target: string, @Request() request: express.Request) {
		const redirect_uri = this.shapeRedirectURI(request);

		const response = (<any>request).res as express.Response;
		response.redirect(
			`https://discord.com/api/oauth2/authorize` +
				`?client_id=${process.env.DISCORD_CLIENT_ID}` +
				`&response_type=code&scope=identify` +
				`&redirect_uri=${redirect_uri}` +
				`&state=${target}` +
				``,
		);
	}
}
