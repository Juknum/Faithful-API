import { Request as ExRequest } from "express";
import { NotFoundError } from "../tools/ApiError";

// REDIRECT URL IS '<origin>/auth/<provider>/callback/<target>'
const REDIRECT_URI_PATHNAME = "/callback/";
// example with discord provider:
// REDIRECT URL IS '<origin>/auth/discord/callback'

export default class AuthService {
	getApiUrl(request: ExRequest): string {
		return `${request.protocol}://${request.headers.host}`;
	}

	rawTargetToURL(target: string): string {
		const url = JSON.parse(process.env.AUTH_URLS)[target];
		if (!url) throw new NotFoundError("Target not found!");
		return url;
	}

	targetToURL(target: string): string {
		return this.rawTargetToURL(target).replace(/\/$/, "");
	}

	getRedirectURI(request: ExRequest, target: string): string {
		const apiOrigin = this.getApiUrl(request);
		const requestPath = request.path;
		const pathSplit = requestPath.split("/");
		pathSplit.pop(); // remove target
		return `${apiOrigin.replace(/\/$/, "")}${pathSplit.join("/")}${REDIRECT_URI_PATHNAME}${target}`;
	}
}
