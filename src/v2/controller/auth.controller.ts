import { Request as ExRequest, Response as ExResponse } from "express";
import { Body, Controller, Get, Path, Post, Query, Request, Route, Tags } from "tsoa";
import AuthService from "../service/auth.service";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
	private readonly service = new AuthService();

	/**
	 * Handles Discord authorization page redirect
	 */
	@Get("discord/callback/{target}")
	public async discordAuthCallback(
		@Path() target: string,
		@Query() code: string,
		@Request() request: ExRequest,
	) {
		const params = new URLSearchParams();
		params.append("client_id", process.env.DISCORD_CLIENT_ID);
		params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
		params.append("grant_type", "authorization_code");
		params.append("code", code);
		params.append("redirect_uri", process.env.REDIRECT_DOMAIN.replace(/\/$/, "") + request.path);
		params.append("scope", "identify");

		const res = (<any>request).res as ExResponse;
		const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			body: params,
		});

		const json: any = await tokenResponse.json();

		if ("error" in json) {
			res.status(500).json(json).end();
			return;
		}

		res.redirect(
			`${this.service.targetToURL(target)}/?access_token=${encodeURIComponent(json.access_token)}&refresh_token=${encodeURIComponent(
				json.refresh_token,
			)}&expires_in=${encodeURIComponent(json.expires_in)}`,
		);
	}

	/**
	 * Handles Discord refresh for new sessions
	 */
	@Post("discord/refresh")
	public async discordAuthRefresh(@Body() refresh_token: string, @Request() request: ExRequest) {
		const params = new URLSearchParams();
		params.append("client_id", process.env.DISCORD_CLIENT_ID);
		params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
		params.append("grant_type", "refresh_token");
		params.append("refresh_token", refresh_token);

		const res = (<any>request).res as ExResponse;
		const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			body: params,
		});
		const json: any = await tokenResponse.json();

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
	public discordAuthGrant(@Path() target: string, @Request() request: ExRequest) {
		const redirectURI = this.service.getRedirectURI(request, target);

		const response = (<any>request).res as ExResponse;
		response.redirect(
			`https://discord.com/api/oauth2/authorize` +
				`?client_id=${process.env.DISCORD_CLIENT_ID}` +
				`&response_type=code&scope=identify` +
				`&redirect_uri=${encodeURIComponent(redirectURI)}`,
		);
	}
}
