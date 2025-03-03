import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import responseTime from "response-time";
import cors from "cors";
import apiErrorHandler from "api-error-handler";

import handleError from "@common/tools/handleError";
import formatSwaggerDoc from "@common/tools/swagger";
import { setupV1 } from "@v1/index";

import { RegisterRoutes } from "../build/routes";

const NO_CACHE = process.env.NO_CACHE === "true";
const PORT = process.env.PORT || 8000;

// Initial setup
const app = express()
	// Minor security improvement to not expose that the API is using Express
	// Note: the code is *open-source* why do we do that?
	.disable("x-powered-by")
	// Middlewares to be used
	.use(
		// Use body parser to read sent json payloads
		//! DO NOT DELETE THE BODY PARSER, IT IS USED TO AGGREGATE DATA AND TRANSFORM IT
		//! SPENT 2 HOURS ON THIS SHIT
		bodyParser.json(),													// parse incoming JSON payload
		bodyParser.urlencoded({ extended: true }),  // parse URL-encoded payload such as form-data
		// Add an "X-Response-Time" header to responses to measures how long the request was
		// Note: do not delete, please
		responseTime(),
		// Make those files in /public directly accessible 
		express.static("public", {
			extensions: ["html", "xml", "json"],
		}),
		cors({
			origin: "*",
			allowedHeaders: ["discord", "content-type"],
		}),
		apiErrorHandler(),
	);

// start process
app.listen(PORT, () => {
	console.log(`Using database at ${process.env.FIRESTORM_URL}`);
	console.log(`API started at http://localhost:${PORT}`);
	if (NO_CACHE) console.log("Cache is disabled!");
});

// serve the documentation
app.get("/", (_req, res) => res.redirect("/docs"));
app.use(
	"/docs",
	swaggerUi.serve,
	swaggerUi.setup(
		formatSwaggerDoc(app, "./public/swagger.json"),
		{
			customCssUrl: "/custom.css",
			customJs: ["/custom.js", "/customDOM.js"],
			swaggerOptions: {
				tryItOutEnabled: true,
			},
			customfavIcon: "https://database.faithfulpack.net/images/branding/logos/favicon.ico",
			customSiteTitle: "Faithful API",
		},
	),
);

setupV1(app);

// start v2 api
RegisterRoutes(app);

// handle errors
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
	if (!err) return next();

	// logs and handles errors
	const apiError = handleError(err, req.path, req.method);
	if (err instanceof ValidateError) {
		res
			.status(422)
			.json({
				message: "Validation Failed",
				details: err?.fields,
			})
			.end();
		return;
	}

	apiErrorHandler()(apiError, req, res, next);
	res.end();
});
