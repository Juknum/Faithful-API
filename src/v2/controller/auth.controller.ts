import { Request as ExRequest, Response as ExResponse } from "express";
import { Body, Controller, Get, Path, Post, Query, Request, Route, Tags } from "tsoa";
import AuthService from "../service/auth.service";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
	private readonly service = new AuthService();

	/**
	 * Redirects to Discord oauth2 authorization page
	 * @param target Redirect target app
	 */
	@Get("discord/{target}")
	public discordAuthGrant(@Path() target: string, @Request() request: ExRequest) {
		const redirectURI = this.service.getRedirectURI(request, target);

		const response = (<any>request).res as ExResponse;
		const params = new URLSearchParams();
		params.append("client_id", process.env.DISCORD_CLIENT_ID);
		params.append("response_type", "code");
		params.append("scope", "identify");
		params.append("redirect_uri", redirectURI);

		response.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
	}

	/**
	 * Handles Discord authorization page redirect
	 * @param target Where to post the auth (provided in /auth/discord/{target})
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
		params.append("redirect_uri", `${this.service.getApiUrl(request)}${request.path}`);
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

		const redirect = new URLSearchParams();
		redirect.append("access_token", json.access_token);
		redirect.append("refresh_token", json.refresh_token);
		redirect.append("expires_in", json.expires_in);
		res.redirect(`${this.service.targetToURL(target)}?${redirect.toString()}`);
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
}
