import { ApiError } from "./v2/tools/ApiError";
import status from "statuses";
import * as firestorm from "firestorm-db";
import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { RegisterRoutes } from "../build/routes";
import { ValidateError } from "tsoa";
import cors from "cors";

import * as dotenv from "dotenv";
import apiErrorHandler from "api-error-handler";
dotenv.config();

const DEV = (process.env.DEV || "false") === "true";
const PORT = process.env.PORT || 8000;

firestorm.address(process.env.FIRESTORM_URL);
firestorm.token(process.env.FIRESTORM_TOKEN);

const app: Application = express();

// Use body parser to read sent json payloads
//! DO NOT DELETE THE BODY PARSER, IT IS USED TO AGGREGATE DATA AND TRANSFORM IT
//! SPENT 2 HOURS ON THIS SHIT
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);
app.use(bodyParser.json());
//! DO NOT DELETE

app.use(
	express.static("public", {
		extensions: ["html", "xml", "json"],
	}),
);

app.get("/", function (req, res) {
	res.redirect("/docs");
});

app.use(cors());

const swaggerDoc = require("../public/swagger.json");
const options: SwaggerUiOptions = {
	customCssUrl: "/custom.css",
	customfavIcon: "https://database.compliancepack.net/images/brand/logos/site/compliance_white.ico",
	customSiteTitle: "Compliance API",
};
// //todo: find out what the fuck we are doing
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

app.use(apiErrorHandler());

RegisterRoutes(app);

const v1 = require("./v1");
app.use("/v1", v1);

app.use(function errorHandler(err: any, req: Request, res: Response, next: NextFunction): Response | void {
	if (err instanceof ValidateError) {
		console.error("ValidateError", err);
		console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
		return res.status(422).json({
			message: "Validation Failed",
			details: err?.fields,
		});
	} else if (err) {
		if (err.isAxiosError) console.error("axios error: body, headers, err", req.body, req.headers, err);
		const code = err.statusCode || (err.response ? err.response.status : err.code) || 400;
		const message = (err.response && err.response.data ? err.response.data.error : err.message) || err;
		const stack = process.env.VERBORSE ? (err.stack ? err.stack : "") : "";

		if (process.env.VERBOSE === "true") {
			console.error("code, message, stack", code, message, stack);
		}

		let name = err.name;

		if (!name)
			try {
				name = status(code).replace(/ /, "");
			} catch (error) {}

		const finalError = new ApiError(name, code, message);

		apiErrorHandler()(finalError, req, res, next);
		return res.end();
	}

	next();
});
