const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

async function authFetch(path: string, opts: RequestInit = {}) {
	const token = localStorage.getItem("token");
	const headers: Record<string, string> = {
		...(opts.headers as Record<string, string> | undefined),
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};

	const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

	if (res.status === 401) {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "/login";
		throw new Error("Unauthorized");
	}

	return res;
}

export async function listarExpedientesPorUsuario(idUsuario: number) {
	const res = await authFetch(`/api/expedientes/por-usuario/${idUsuario}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener expedientes");
	}
	const body = await res.json();
	return body.data || [];
}

export async function listarTodosExpedientes() {
	const res = await authFetch(`/api/expedientes`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener expedientes");
	}
	const body = await res.json();
	return body.data || [];
}

export async function crearExpediente(payload: any) {
	const res = await authFetch(`/api/expedientes`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error creando expediente");
	}
	return res.json();
}

export async function listarDepartamentos() {
	const res = await authFetch(`/api/catalogs/departamentos`);
	if (!res.ok) return [];
	const body = await res.json();
	return body.data || [];
}

export async function listarMunicipios(idDepartamento?: number) {
	const q = idDepartamento ? `?id_departamento=${idDepartamento}` : "";
	const res = await authFetch(`/api/catalogs/municipios${q}`);
	if (!res.ok) return [];
	const body = await res.json();
	return body.data || [];
}

export async function listarTiposIndicio() {
	const res = await authFetch(`/api/catalogs/tipos-indicio`);
	if (!res.ok) return [];
	const body = await res.json().catch(() => null);
	return body?.data || [];
}

export async function obtenerExpediente(id: number) {
	const res = await authFetch(`/api/expedientes/${id}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error obteniendo expediente");
	}
	const body = await res.json();
	return body.data || null;
}

export async function obtenerUsuario(id: number) {
	const res = await authFetch(`/api/usuarios/${id}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener usuario");
	}
	const body = await res.json().catch(() => null);
	return body?.data || null;
}

export async function actualizarExpediente(id: number, payload: any) {
	const res = await authFetch(`/api/expedientes/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error actualizando expediente");
	}
	return res.json();
}

export async function listarIndiciosPorExpediente(idExpediente: number) {
	const res = await authFetch(`/api/indicios/por-expediente/${idExpediente}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener indicios");
	}
	const body = await res.json();
	return body.data || [];
}

export async function listarEstadosPorExpediente(idExpediente: number) {
	const res = await authFetch(
		`/api/expediente-estados/por-expediente/${idExpediente}`
	);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener estados");
	}
	const body = await res.json();
	return body.data || [];
}

export async function listarCatalogoEstados() {
	const res = await authFetch(`/api/catalogs/estados`);
	if (!res.ok) return [];
	const body = await res.json().catch(() => null);
	return body?.data || [];
}

export async function crearExpedienteEstado(payload: any) {
	const res = await authFetch(`/api/expediente-estados`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al crear estado de expediente");
	}
	return res.json();
}

export async function crearIndicio(payload: any) {
	const res = await authFetch(`/api/indicios`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error creando indicio");
	}
	return res.json();
}

export async function obtenerIndicio(id: number) {
	const res = await authFetch(`/api/indicios/${id}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener indicio");
	}
	const body = await res.json().catch(() => null);
	return body?.data || null;
}

export async function actualizarIndicio(id: number, payload: any) {
	const res = await authFetch(`/api/indicios/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error actualizando indicio");
	}
	return res.json();
}

export async function obtenerReporteSummary(params: {
	fecha_inicio?: string | null;
	fecha_fin?: string | null;
	id_estado?: number | null;
}) {
	const q: string[] = [];
	if (params.fecha_inicio)
		q.push(`fecha_inicio=${encodeURIComponent(params.fecha_inicio)}`);
	if (params.fecha_fin)
		q.push(`fecha_fin=${encodeURIComponent(params.fecha_fin)}`);
	if (typeof params.id_estado !== "undefined" && params.id_estado !== null)
		q.push(`id_estado=${params.id_estado}`);
	const qs = q.length ? `?${q.join("&")}` : "";
	const res = await authFetch(`/api/reports/summary${qs}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener reporte summary");
	}
	return res.json();
}

export async function obtenerReporteTimeseries(params: {
	fecha_inicio?: string | null;
	fecha_fin?: string | null;
	id_estado?: number | null;
}) {
	const q: string[] = [];
	if (params.fecha_inicio)
		q.push(`fecha_inicio=${encodeURIComponent(params.fecha_inicio)}`);
	if (params.fecha_fin)
		q.push(`fecha_fin=${encodeURIComponent(params.fecha_fin)}`);
	if (typeof params.id_estado !== "undefined" && params.id_estado !== null)
		q.push(`id_estado=${params.id_estado}`);
	const qs = q.length ? `?${q.join("&")}` : "";
	const res = await authFetch(`/api/reports/timeseries${qs}`);
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || "Error al obtener reporte timeseries");
	}
	return res.json();
}

export function exportSummaryToCSV(
	payload: any,
	filename = "reporte_summary.csv"
) {
	const rows: string[] = [];
	rows.push(["Estado", "Cantidad"].join(","));
	const counts = payload.countsByEstado || [];
	for (const r of counts) {
		rows.push([`"${r.nombre_estado}"`, String(r.cantidad)].join(","));
	}
	rows.push("");
	rows.push(
		[
			"Total expedientes creados",
			String(payload.total_expedientes_creados || 0),
		].join(",")
	);

	const csv = rows.join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function exportTimeseriesToCSV(
	payload: any,
	filename = "reporte_timeseries.csv"
) {
	const rows: string[] = [];
	rows.push(["Fecha", "Tipo", "Cantidad"].join(","));
	const trans = payload.transitions || [];
	for (const t of trans)
		rows.push([String(t.fecha), "transicion", String(t.cantidad)].join(","));
	const regs = payload.registros || [];
	for (const r of regs)
		rows.push([String(r.fecha), "registro", String(r.cantidad)].join(","));

	const csv = rows.join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
