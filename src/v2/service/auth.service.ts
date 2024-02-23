import { Request as ExRequest } from "express";

// REDIRECT URL IS '<origin>/auth/<provider>/callback/<target>'
const REDIRECT_URI_PATHNAME = "/callback/";
// example with discord provider:
// REDIRECT URL IS '<origin>/auth/discord/callback'

export default class AuthService {
	rawTargetToURL(target: string) {
		if (target === "webapp") return process.env.WEBAPP_URL;
		return "";
	}

	targetToURL(target: string) {
		return this.rawTargetToURL(target).replace(/\/$/, "");
	}

	getRedirectURI(request: ExRequest, target: string) {
		const apiOrigin = `${request.protocol}://${request.headers.host}`;
		const requestPath = request.path;
		const pathSplit = requestPath.split("/");
		pathSplit.pop(); // remove target
		return apiOrigin.replace(/\/$/, "") + pathSplit.join("/") + REDIRECT_URI_PATHNAME + target;
	}
}
