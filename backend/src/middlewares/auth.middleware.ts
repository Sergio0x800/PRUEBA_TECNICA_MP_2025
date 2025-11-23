import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

const JWT_SECRET = config.jwtSecret;

export default function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const authHeader = (req.headers["authorization"] ||
		req.headers["Authorization"]) as string | undefined;
	if (!authHeader) {
		res.status(401).json({ message: "Token no proporcionado" });
		return;
	}

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		res.status(401).json({ message: "Formato de token inválido" });
		return;
	}

	const token = parts[1];
	try {
		const payload = jwt.verify(token as string, JWT_SECRET as string) as any;
		(req as any).user = payload;
		next();
	} catch (err) {
		res.status(401).json({
			message: "Token inválido",
			error: err instanceof Error ? err.message : err,
		});
	}
}
