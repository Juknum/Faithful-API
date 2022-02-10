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

export default function formHandler(app: Application, url: string, controller: Controller, method: Function): void {
	app.post(
		url,
		async function (req: ExRequest, res: ExResponse, next: NextFunction) {
			req["user"] = await expressAuthentication(req, "discord", ["addon:own"]);
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
}
