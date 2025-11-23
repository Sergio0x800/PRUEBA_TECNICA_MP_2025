import { Request, Response, NextFunction } from "express";
import { HttpError, isHttpError } from "../utils/httpError";

function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (res.headersSent) {
		return next(err);
	}

	let status = 500;
	let message = "Error interno del servidor";
	let details: any = undefined;

	if (isHttpError(err)) {
		status = err.statusCode || 500;
		message = err.message || message;
		details = err.details;
	} else if (err instanceof Error) {
		message = err.message;
	}

	console.error(
		`[ErrorHandler] ${req.method} ${req.originalUrl} -> ${status} :`,
		message,
		details || err
	);

	res.status(status).json({
		success: false,
		message,
		...(details ? { details } : {}),
	});
}

export default errorHandler;
