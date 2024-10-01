import { AxiosError } from "axios";
import status from "statuses";
import { APIError } from "./errors";

/**
 * Handle and log errors
 * @param err error to handle
 * @returns front-end API error to show user
 */
export default function handleError(err: any, route: string): APIError {
	const code =
		Number(
			(typeof err.status === "number" ? err.status : err.statusCode) ||
				(err.response ? err.response.status : err.code),
		) || 400;
	const message =
		(err.response && err.response.data
			? err.response.data.error || err.response.data.message
			: err.message) || err;
	const stack = process.env.VERBOSE && err.stack ? err.stack : "";

	let printed = false;
	if (process.env.VERBOSE === "true") {
		console.error(`[${new Date().toUTCString()}] ${route}`);
		// if the message already includes a stack don't print it twice
		if (message?.stack) console.error(`(${code})`, message);
		else console.error(`(${code})`, message, "\n", stack);
		printed = true;
	}
	if (err instanceof AxiosError) {
		console.error(
			"Axios Error: Request, Response\n:request:",
			err.request,
			"\nresponse:",
			err.response,
		);
		printed = true;
	}
	// print some empty lines between each error so scrolling through logs doesn't give you a migraine
	if (printed) console.error("\n\n");

	let name = err?.response?.data?.name || err.name;

	if (!name) {
		try {
			name = status(code).replace(/ /g, "");
		} catch {
			// you tried your best, we don't blame you
			name = "Unknown Error";
		}
	}

	const finalError = new APIError(name, code, message);

	// modify error to give more context and details with data
	let modified: {
		name: string;
		message: string;
	};

	if (err?.response?.data !== undefined) {
		modified = {
			name: finalError.name,
			message: finalError.message,
		};
		finalError.name += `: ${finalError.message}`;
		finalError.message = err.response.data;
	}

	// unmodify error to hide details returned as api response
	if (modified !== undefined) {
		finalError.name = modified.name;
		finalError.message = modified.message;
	}

	// front-end users don't need the stack
	delete finalError.stack;

	return finalError;
}
