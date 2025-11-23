export function normalizeRole(r: any): string {
	if (!r) return "";
	if (typeof r === "string") return r.toLowerCase();
	if (typeof r === "object")
		return String(r?.nombre || r?.name || r?.role || "").toLowerCase();
	return String(r).toLowerCase();
}

export function extractRoles(user: any): string[] {
	if (!user) return [];
	const roles = user.roles ?? user.rol ?? user.rolesNames ?? [];
	if (Array.isArray(roles)) return roles.map(normalizeRole).filter(Boolean);
	if (typeof roles === "string") return [roles.toLowerCase()];
	return [];
}

export function isRole(user: any, role: string): boolean {
	const r = role ? String(role).toLowerCase() : "";
	if (!r) return false;
	const roles = extractRoles(user);
	return roles.some((x) => x === r);
}

export function isTecnico(user: any): boolean {
	return isRole(user, "tecnico");
}

export function isCoordinador(user: any): boolean {
	return isRole(user, "coordinador");
}

export default {
	normalizeRole,
	extractRoles,
	isRole,
	isTecnico,
	isCoordinador,
};
