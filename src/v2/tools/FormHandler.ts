import { JsonObject } from "swagger-ui-express";
import { Controller } from "tsoa";
import multer from "multer";
import { expressAuthentication } from "./authentification";
import { Application, NextFunction, Response as ExResponse, Request as ExRequest } from "express";

const upload = multer();

function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
	if (response.headersSent) {
		return;
	}
	Object.keys(headers).forEach((name: string) => {
		response.set(name, headers[name]);
	});
	if (data && typeof data.pipe === "function" && data.readable && typeof data._read === "function") {
		data.pipe(response);
	} else if (data !== null && data !== undefined) {
		response.status(statusCode || 200).json(data);
	} else {
		response.status(statusCode || 204).end();
	}
}

function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
	return Promise.resolve(promise)
		.then((data: any) => {
			let statusCode = controllerObj.getStatus() || successStatus;
			let headers = controllerObj.getHeaders();

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			returnHandler(response, statusCode, data, headers);
		})
		.catch((error: any) => next(error));
}

interface SwaggerDocOptions {
	prefix: string;
	security: { [key: string]: string[] };
	operationId: string;
	description: string;
}

export default function formHandler(
	app: Application,
	url: string,
	controller: Controller,
	method: Function,
	swaggerDoc: JsonObject,
	swaggerDocOptions: SwaggerDocOptions,
): JsonObject {
	app.post(
		url,
		async function (req: ExRequest, res: ExResponse, next: NextFunction) {
			req["user"] = await expressAuthentication(req, "discord", ["addon:own"]).catch((err) => next(err));
			next();
		},
		upload.single("file"),
		function handler(req: ExRequest, res: ExResponse, next: NextFunction) {
			try {
				const promise = method.apply(controller, [req.params[Object.keys(req.params)[0]], req.file, req]);
				promiseHandler(controller, promise, res, 200, next);
			} catch (error) {
				next(error);
			}
		},
	);

	// add doc
	const pathCorrected = url.replace(swaggerDocOptions.prefix, "").replace(/:([A-ZA-z_]+)/, "{$1}");
	if (!("paths" in swaggerDoc)) swaggerDoc.paths = {};
	if (!(pathCorrected in swaggerDoc.paths)) swaggerDoc.paths[pathCorrected] = {};
	swaggerDoc.paths[pathCorrected].post = {
		operationId: swaggerDocOptions.operationId,
		responses: {
			"201": {
				description: "File created",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/File",
						},
					},
				},
			},
			"403": {
				description: "",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PermissionError",
						},
					},
				},
			},
			"404": {
				description: "",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/NotFoundError",
						},
					},
				},
			},
		},
		description: swaggerDocOptions.description,
		tags: ["Addons"],
		security: [swaggerDocOptions.security],
		parameters: [
			{
				description: "ID or slug of the requested add-on",
				in: "path",
				name: "id_or_slug",
				required: true,
				schema: {
					type: "string",
				},
			},
		],
		requestBody: {
			content: {
				"multipart/form-data": {
					schema: {
						type: "object",
						properties: {
							file: {
								description: "Header file",
								type: "file",
							},
						},
						required: ["file"],
					},
				},
			},
		},
	};

	return swaggerDoc;
}
