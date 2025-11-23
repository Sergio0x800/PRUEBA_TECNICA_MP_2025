import { Request, Response, NextFunction } from "express";

function normalizeRoleValue(r: any): string {
	if (!r) return "";
	if (typeof r === "string") return r.toLowerCase();
	if (typeof r === "object") {
		return String(r?.nombre || r?.name || r?.role || "").toLowerCase();
	}
	return String(r).toLowerCase();
}

function extractRolesFromUser(user: any): string[] {
	if (!user) return [];
	const roles = user.roles ?? user?.rol ?? user?.rolesNames ?? [];
	if (Array.isArray(roles))
		return roles.map(normalizeRoleValue).filter(Boolean);
	if (typeof roles === "string") return [roles.toLowerCase()];
	return [];
}

export function permit(...allowed: string[]) {
	const allowedLower = allowed.map((s) => String(s).toLowerCase());
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user;
		if (!user) {
			return res.status(401).json({ message: "No autenticado" });
		}
		const roles = extractRolesFromUser(user);
		const ok = roles.some((r) => allowedLower.includes(r));
		if (!ok) return res.status(403).json({ message: "Acceso denegado" });
		return next();
	};
}

export function deny(...denied: string[]) {
	const deniedLower = denied.map((s) => String(s).toLowerCase());
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user;
		if (!user) {
			return res.status(401).json({ message: "No autenticado" });
		}
		const roles = extractRolesFromUser(user);
		const blocked = roles.some((r) => deniedLower.includes(r));
		if (blocked) return res.status(403).json({ message: "Acceso denegado" });
		return next();
	};
}

export default { permit, deny };
