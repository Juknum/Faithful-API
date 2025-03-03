/* eslint-disable func-names */

import { BadRequestError } from "@common/tools/errors";
import { MulterFile } from "@common/types";

interface HandleFileOptions {
	maxSize?: number;
	allowedMimeTypes?: string[];
}

export function HandleFile(options?: HandleFileOptions) {
	return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {

		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const file: MulterFile | undefined = args.find((arg) => 
				arg && typeof arg === "object"
				&& "fieldname" in arg
				&& "originalname" in arg
				&& "encoding" in arg
				&& "mimetype" in arg
				&& "size" in arg
				&& "buffer" in arg
			);
			
			if (!file) {
				throw new BadRequestError("File is required");
			}

			// Validate file size
			if (options?.maxSize && file.size > options.maxSize) {
				throw new BadRequestError(`File size exceeds ${options.maxSize} bytes`);
			}

			// Validate MIME type
			if (options?.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
				throw new BadRequestError(`Incorrect file mime type provided, '${options.allowedMimeTypes.join("' or '")}' expected`);
			}

			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}
