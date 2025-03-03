import { Express } from "express"

export function setupV1(app: Express): void {
	app.all("/v1/*", (_, res) => {
		res.status(410)
			.json({
				message: "API v1 has been discontinued. Please switch to API v2 for all new endpoints.",
			});
	});
}