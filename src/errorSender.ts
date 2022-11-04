import axios from "axios";
import * as dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

const BOT_ENDPOINT = process.env.DISCORD_BOT_ENDPOINT;

const safeStringify = (obj, indent = 2) => {
	let cache = [];
	const retVal = JSON.stringify(
		obj,
		(key, value) =>
			// eslint-disable-next-line no-nested-ternary
			typeof value === "object" && value !== null
				? cache.includes(value)
					? undefined // Duplicate reference found, discard key
					: cache.push(value) && value // Store value in our collection
				: value,
		indent
	);
	cache = null;
	return retVal;
};

export default async function sendError(
	code: number | null,
	err: any,
	req: Request,
	stack: string,
	message?: string
) {
	if (!BOT_ENDPOINT || code === 404 || code === 403) return;

	const payload = {
		type: "ApiError",
		content: {
			message: message || null,
			code,
			err,
			stack,
			request: {
				host: req.get("host") || req.headers.host || null,
				origin: req.get("origin") || req.headers.origin || null,
				protocol: req.protocol,
				method: req.method,
				rawHeaders: req.rawHeaders,
				params: req.params,
				url: req.url,
				path: req.path,
				route: req.route.path,
				body: req.body,
			},
		},
	};

	// ignore errors from this else we are not done
	await axios
		.post(BOT_ENDPOINT, JSON.parse(safeStringify(payload)))
		.catch(() => {});
}
