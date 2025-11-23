const API_URL = "http://localhost:3000";

type LoginPayload = { usuario: string; clave: string };

export async function login(payload: LoginPayload) {
	const res = await fetch(`${API_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error en login");
	}
	return res.json();
}
