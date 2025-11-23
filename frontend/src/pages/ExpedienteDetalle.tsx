import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	obtenerExpediente,
	listarIndiciosPorExpediente,
	listarEstadosPorExpediente,
	listarCatalogoEstados,
	crearExpedienteEstado,
	listarDepartamentos,
	listarMunicipios,
	obtenerUsuario,
} from "../services/expedientes";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
	Box,
	Button,
	Tabs,
	Tab,
	Paper,
	Typography,
	Card,
	CardContent,
	CardActions,
	IconButton,
	Stack,
	Chip,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Snackbar,
	Alert,
	Avatar,
	Tooltip,
} from "@mui/material";
import {
	Timeline,
	TimelineItem,
	TimelineSeparator,
	TimelineConnector,
	TimelineContent,
	TimelineDot,
	TimelineOppositeContent,
} from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import ApartmentIcon from "@mui/icons-material/Apartment";

export default function ExpedienteDetalle() {
	const params = useParams();
	const id = params.id ? Number(params.id) : null;
	const navigate = useNavigate();

	const [exp, setExp] = useState<any | null>(null);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"indicios" | "historial">(
		"indicios"
	);
	const [indicios, setIndicios] = useState<any[]>([]);
	const [estados, setEstados] = useState<any[]>([]);
	const [catalogoEstados, setCatalogoEstados] = useState<any[]>([]);
	const [userNames, setUserNames] = useState<Record<number, string>>({});
	const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
	const [changing, setChanging] = useState(false);
	const [motivoRechazo, setMotivoRechazo] = useState<string>("");
	const [motivoError, setMotivoError] = useState<boolean>(false);
	const [showMotivo, setShowMotivo] = useState<boolean>(false);
	const MAX_MOTIVO = 500;

	useEffect(() => {
		const sel = catalogoEstados.find(
			(c: any) => c.id_estado_expediente === selectedEstado
		);
		const isRechazado = sel && String(sel.nombre).toLowerCase() === "rechazado";
		setShowMotivo(Boolean(isRechazado));
		if (!isRechazado) setMotivoRechazo("");
	}, [selectedEstado, catalogoEstados]);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMsg, setSnackbarMsg] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
		"success"
	);

	const tokenUser: any =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("user") || "null")
			: null;
	const isTecnico =
		Array.isArray(tokenUser?.roles) &&
		tokenUser.roles.some((r: any) => {
			const name =
				typeof r === "string" ? r : r?.nombre || r?.nombre_rol || r?.name || "";
			return String(name).toLowerCase() === "tecnico";
		});

	const allowedEstadosForTecnico = (() => {
		if (!catalogoEstados || catalogoEstados.length === 0 || !exp) return [];
		const namesToId: Record<string, number> = {};
		for (const c of catalogoEstados) {
			const n = String(c.nombre || "").toLowerCase();
			namesToId[n] = c.id_estado_expediente;
		}
		const enRevisionId =
			namesToId["en revisión"] ?? namesToId["en revision"] ?? null;
		const registradoIdLocal = namesToId["registrado"] ?? 1;
		const rechazadoIdLocal = namesToId["rechazado"] ?? null;
		if (!enRevisionId) return [];
		const current = Number(exp.id_ultimo_estado_expediente);
		const allowedFrom = [Number(registradoIdLocal)];
		if (rechazadoIdLocal) allowedFrom.push(Number(rechazadoIdLocal));
		if (allowedFrom.includes(current))
			return catalogoEstados.filter(
				(c: any) => c.id_estado_expediente === enRevisionId
			);
		return [];
	})();

	const isCoordinador =
		Array.isArray(tokenUser?.roles) &&
		tokenUser.roles.some((r: any) => {
			const name =
				typeof r === "string" ? r : r?.nombre || r?.nombre_rol || r?.name || "";
			return String(name).toLowerCase() === "coordinador";
		});

	const allowedEstadosForCoordinador = (() => {
		if (!catalogoEstados || catalogoEstados.length === 0 || !exp) return [];
		const namesToId: Record<string, number> = {};
		for (const c of catalogoEstados) {
			const n = String(c.nombre || "").toLowerCase();
			namesToId[n] = c.id_estado_expediente;
		}
		const enRevisionId =
			namesToId["en revisión"] ?? namesToId["en revision"] ?? null;
		const aprobadoId = namesToId["aprobado"] ?? null;
		const rechazadoId = namesToId["rechazado"] ?? null;
		const archivadoId = namesToId["archivado"] ?? null;
		const current = Number(exp.id_ultimo_estado_expediente);
		const ids: number[] = [];
		if (enRevisionId && current === enRevisionId) {
			if (aprobadoId) ids.push(aprobadoId);
			if (rechazadoId) ids.push(rechazadoId);
			if (archivadoId) ids.push(archivadoId);
		} else if (rechazadoId && current === rechazadoId) {
			if (enRevisionId) ids.push(enRevisionId);
		} else if (aprobadoId && current === aprobadoId) {
			if (archivadoId) ids.push(archivadoId);
		}
		return catalogoEstados.filter((c: any) =>
			ids.includes(c.id_estado_expediente)
		);
	})();

	const registradoId =
		catalogoEstados.find(
			(c: any) => String(c.nombre || "").toLowerCase() === "registrado"
		)?.id_estado_expediente ?? 1;
	const rechazadoId =
		catalogoEstados.find(
			(c: any) => String(c.nombre || "").toLowerCase() === "rechazado"
		)?.id_estado_expediente ?? null;

	const canEditExpediente = (() => {
		if (isCoordinador) return false;
		if (!isTecnico) return true;
		if (!exp) return false;
		if (Number(exp.id_usuario_registro) !== Number(tokenUser?.id_usuario))
			return false;
		const current = Number(exp.id_ultimo_estado_expediente);
		const allowed = [Number(registradoId)];
		if (rechazadoId) allowed.push(Number(rechazadoId));
		return allowed.includes(current);
	})();

	useEffect(() => {
		async function load() {
			if (!id) return;
			setLoading(true);
			try {
				const row = await obtenerExpediente(id);
				let departamento_nombre = "";
				let municipio_nombre = "";
				try {
					const deps = await listarDepartamentos();
					const foundDep = deps.find(
						(d: any) => d.id_departamento === row?.id_departamento
					);
					if (foundDep) departamento_nombre = foundDep.nombre;
				} catch (e) {
					console.warn("No se pudo cargar departamentos", e);
				}
				try {
					const munis = row?.id_departamento
						? await listarMunicipios(row.id_departamento)
						: [];
					const foundMun = munis.find(
						(m: any) => m.id_municipio === row?.id_municipio
					);
					if (foundMun) municipio_nombre = foundMun.nombre;
				} catch (e) {
					console.warn("No se pudo cargar municipios", e);
				}
				setExp({ ...row, departamento_nombre, municipio_nombre });
				try {
					const listI = await listarIndiciosPorExpediente(id);
					setIndicios(listI || []);
				} catch (e) {
					console.warn("No se pudo cargar indicios", e);
				}
				try {
					const listE = await listarEstadosPorExpediente(id);
					setEstados(listE || []);
					try {
						const ids = Array.from(
							new Set(
								(listE || [])
									.map((s: any) => s.id_usuario_registro)
									.filter(Boolean)
							)
						) as number[];
						if (ids.length > 0) {
							const users = await Promise.all(
								ids.map((uId: number) => obtenerUsuario(uId).catch(() => null))
							);
							const map: Record<number, string> = {};
							users.forEach((u: any) => {
								if (u && (u.id_usuario || u.id)) {
									const idKey = u.id_usuario || u.id;
									map[idKey] = `${u.nombres || u.nombre || ""} ${
										u.apellidos || ""
									}`.trim();
								}
							});
							setUserNames(map);
						}
					} catch (e) {
						console.warn("No se pudieron resolver nombres de usuarios", e);
					}
				} catch (e) {
					console.warn("No se pudo cargar estados", e);
				}
				try {
					const cats = await listarCatalogoEstados();
					setCatalogoEstados(cats || []);
					if (row?.id_ultimo_estado_expediente) {
						setSelectedEstado(row.id_ultimo_estado_expediente);
						const found = cats.find(
							(c: any) =>
								c.id_estado_expediente === row.id_ultimo_estado_expediente
						);
						if (found)
							setExp((prev: any) => ({
								...prev,
								ultimo_estado_nombre: found.nombre,
							}));
					} else if (cats && cats.length > 0) {
						setSelectedEstado(cats[0].id_estado_expediente);
					}
				} catch (e) {
					console.warn("No se pudo cargar catálogo de estados", e);
				}
			} catch (err) {
				console.warn("No se pudo cargar expediente", err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [id]);

	const indicioColumns: GridColDef[] = [
		{ field: "id_indicio", headerName: "ID", width: 90 },
		{ field: "numero_indicio", headerName: "Numero", width: 120 },
		{ field: "descripcion", headerName: "Descripción", flex: 1, minWidth: 200 },
		{ field: "tipo", headerName: "Tipo", width: 140 },
		{ field: "ubicacion", headerName: "Ubicación", width: 180 },
		{ field: "fecha_registro", headerName: "Fecha registro", width: 180 },
		{
			field: "acciones",
			headerName: "Acciones",
			width: 150,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams) => {
				const onEdit = () => {
					const idInd = params.row.id_indicio;
					navigate(
						`/app/expedientes/${params.row.id_expediente}/indicios/${idInd}/editar`
					);
				};
				const canEditIndicio = (() => {
					if (!isTecnico) return true;
					if (!exp) return false;
					if (Number(exp.id_usuario_registro) !== Number(tokenUser?.id_usuario))
						return false;
					const current = Number(exp.id_ultimo_estado_expediente);
					const allowed = [Number(registradoId)];
					if (rechazadoId) allowed.push(Number(rechazadoId));
					return allowed.includes(current);
				})();

				return (
					<Button
						variant="outlined"
						size="small"
						onClick={onEdit}
						disabled={!canEditIndicio}
					>
						Editar
					</Button>
				);
			},
		},
	];

	if (!id) return <div>ID inválido</div>;

	function formatDate(d?: string | null) {
		if (!d) return "—";
		try {
			const dt = new Date(d);
			return dt.toLocaleString();
		} catch (e) {
			return String(d);
		}
	}

	return (
		<div>
			<div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
				<div style={{ flex: 1 }}>
					<Card sx={{ boxShadow: "none", borderRadius: 2 }}>
						<CardContent>
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="space-between"
							>
								<Typography variant="h6">
									Expediente {exp?.codigo_expediente}
								</Typography>
								<Stack direction="row" spacing={1}>
									<IconButton
										size="small"
										onClick={() => navigate("/app/expedientes")}
										aria-label="Regresar"
									>
										<ArrowBackIcon />
									</IconButton>
									{canEditExpediente && (
										<IconButton
											size="small"
											onClick={() => navigate(`/app/expedientes/${id}/editar`)}
											aria-label="Editar"
										>
											<EditIcon />
										</IconButton>
									)}
								</Stack>
							</Stack>
							<Box
								sx={{
									mt: 1,
									display: "flex",
									gap: 1,
									alignItems: "center",
									flexWrap: "wrap",
								}}
							>
								<Chip
									label={`Último estado: ${
										exp?.ultimo_estado_nombre ??
										exp?.id_ultimo_estado_expediente ??
										"N/A"
									}`}
									size="small"
								/>
							</Box>
							<Box sx={{ mt: 2 }}>
								<Typography variant="body2" color="text.secondary">
									<strong>Descripción:</strong> {exp?.descripcion || "—"}
								</Typography>
								<Box
									sx={{
										mt: 1,
										display: "flex",
										gap: 2,
										alignItems: "center",
										flexWrap: "wrap",
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<ApartmentIcon fontSize="small" color="action" />
										<Typography variant="body2">
											{exp?.departamento_nombre ?? exp?.id_departamento ?? "—"}
										</Typography>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<PlaceIcon fontSize="small" color="action" />
										<Typography variant="body2">
											{exp?.municipio_nombre ?? exp?.id_municipio ?? "—"}
										</Typography>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
										<Typography variant="body2">
											<strong>Fecha hecho:</strong> {exp?.fecha_hecho ?? "—"}
										</Typography>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</div>
			</div>

			<div style={{ background: "#fff", padding: 12, borderRadius: 6 }}>
				<Box sx={{ mb: 2 }}>
					<Paper elevation={0} sx={{ bgcolor: "transparent" }}>
						<Tabs
							value={activeTab === "indicios" ? 0 : 1}
							onChange={(_e, v) =>
								setActiveTab(v === 0 ? "indicios" : "historial")
							}
							indicatorColor="primary"
							textColor="primary"
						>
							<Tab label={<Typography variant="button">Indicios</Typography>} />
							<Tab
								label={<Typography variant="button">Historial</Typography>}
							/>
						</Tabs>
					</Paper>
				</Box>

				{activeTab === "indicios" && (
					<div>
						<div style={{ marginBottom: 8 }}>
							{}
							{(() => {
								const user = localStorage.getItem("user")
									? JSON.parse(localStorage.getItem("user") as string)
									: null;
								const isTecnicoLocal =
									Array.isArray(user?.roles) &&
									user.roles.some((r: any) => {
										const name =
											typeof r === "string"
												? r
												: r?.nombre || r?.name || r?.nombre_rol || "";
										return String(name).toLowerCase() === "tecnico";
									});
								const isCoordinadorLocal =
									Array.isArray(user?.roles) &&
									user.roles.some((r: any) => {
										const name =
											typeof r === "string"
												? r
												: r?.nombre || r?.name || r?.nombre_rol || "";
										return String(name).toLowerCase() === "coordinador";
									});
								const canCreateIndicio = (() => {
									if (isCoordinadorLocal) return false;
									if (!isTecnicoLocal) return true;
									if (!exp) return false;
									if (
										Number(exp.id_usuario_registro) !== Number(user?.id_usuario)
									)
										return false;
									const current = Number(exp.id_ultimo_estado_expediente);
									const allowed = [Number(registradoId)];
									if (rechazadoId) allowed.push(Number(rechazadoId));
									return allowed.includes(current);
								})();
								return (
									<Button
										variant="contained"
										onClick={() =>
											navigate(`/app/expedientes/${id}/indicios/nuevo`)
										}
										disabled={!canCreateIndicio}
									>
										Agregar nuevo indicio
									</Button>
								);
							})()}
						</div>
						<Box sx={{ width: "100%" }}>
							<DataGrid
								rows={indicios.map((i) => ({ ...i, id: i.id_indicio }))}
								columns={indicioColumns}
								autoHeight
								initialState={{
									pagination: { paginationModel: { pageSize: 10, page: 0 } },
								}}
								pageSizeOptions={[10, 25, 50]}
								disableRowSelectionOnClick
								loading={false}
							/>
						</Box>
					</div>
				)}

				{activeTab === "historial" && (
					<div>
						<div style={{ marginBottom: 12 }}>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Último estado:</strong>{" "}
								{exp?.ultimo_estado_nombre ??
									exp?.id_ultimo_estado_expediente ??
									"N/A"}
							</Typography>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								spacing={2}
								alignItems="center"
							>
								<FormControl size="small" sx={{ minWidth: 220 }}>
									<InputLabel id="select-estado-label">Nuevo estado</InputLabel>
									<Select
										labelId="select-estado-label"
										value={selectedEstado ?? ""}
										label="Nuevo estado"
										onChange={(e) => setSelectedEstado(Number(e.target.value))}
									>
										{(isTecnico
											? allowedEstadosForTecnico
											: isCoordinador
											? allowedEstadosForCoordinador
											: catalogoEstados
										).map((c) => (
											<MenuItem
												key={c.id_estado_expediente}
												value={c.id_estado_expediente}
											>
												{c.nombre}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								{}
								{showMotivo && isCoordinador && (
									<Box sx={{ minWidth: 300 }}>
										<FormControl fullWidth>
											<TextField
												label="Motivo de rechazo"
												value={motivoRechazo}
												onChange={(e) => {
													const v = e.target.value.slice(0, MAX_MOTIVO);
													setMotivoRechazo(v);
													if (motivoError && v.trim()) setMotivoError(false);
												}}
												multiline
												minRows={2}
												maxRows={6}
												inputProps={{ maxLength: MAX_MOTIVO }}
												helperText={
													motivoError
														? "El motivo de rechazo es obligatorio"
														: `${motivoRechazo.length}/${MAX_MOTIVO}`
												}
												variant="outlined"
												required
												error={motivoError}
											/>
										</FormControl>
									</Box>
								)}
								<Button
									variant="contained"
									onClick={async () => {
										if (!id || !selectedEstado) return;
										const sel = catalogoEstados.find(
											(c: any) => c.id_estado_expediente === selectedEstado
										);
										const isRechazado =
											sel && String(sel.nombre).toLowerCase() === "rechazado";
										if (isRechazado && !motivoRechazo?.trim()) {
											setSnackbarMsg(
												"El motivo de rechazo es obligatorio cuando se marca como Rechazado"
											);
											setSnackbarSeverity("error");
											setSnackbarOpen(true);
											return;
										}
										setChanging(true);
										try {
											const user = JSON.parse(
												localStorage.getItem("user") || "null"
											);
											await crearExpedienteEstado({
												id_expediente: id,
												id_estado_expediente: selectedEstado,
												id_coordinador_revision:
													user?.id_usuario || user?.id || 1,
												motivo_rechazo: isRechazado
													? motivoRechazo.trim()
													: null,
												id_usuario_registro: user?.id_usuario || user?.id || 1,
											});
											const refreshed = await listarEstadosPorExpediente(id);
											setEstados(refreshed || []);
											try {
												const ids = Array.from(
													new Set(
														(refreshed || [])
															.map((s: any) => s.id_usuario_registro)
															.filter(Boolean)
													)
												) as number[];
												if (ids.length > 0) {
													const users = await Promise.all(
														ids.map((uId: number) =>
															obtenerUsuario(uId).catch(() => null)
														)
													);
													const map: Record<number, string> = {};
													users.forEach((u: any) => {
														if (u && (u.id_usuario || u.id)) {
															const idKey = u.id_usuario || u.id;
															map[idKey] = `${u.nombres || u.nombre || ""} ${
																u.apellidos || ""
															}`.trim();
														}
													});
													setUserNames(map);
												}
											} catch (e) {
												console.warn(
													"No se pudieron resolver nombres de usuarios",
													e
												);
											}
											const newExp = await obtenerExpediente(id);
											let departamento_nombre =
												newExp?.departamento_nombre ?? "";
											let municipio_nombre = newExp?.municipio_nombre ?? "";
											try {
												const deps = await listarDepartamentos();
												const foundDep = deps.find(
													(d: any) =>
														d.id_departamento === newExp?.id_departamento
												);
												if (foundDep) departamento_nombre = foundDep.nombre;
											} catch (e) {
												console.warn(
													"No se pudo resolver departamento tras cambio de estado",
													e
												);
											}
											try {
												const munis = newExp?.id_departamento
													? await listarMunicipios(newExp.id_departamento)
													: [];
												const foundMun = munis.find(
													(m: any) => m.id_municipio === newExp?.id_municipio
												);
												if (foundMun) municipio_nombre = foundMun.nombre;
											} catch (e) {
												console.warn(
													"No se pudo resolver municipio tras cambio de estado",
													e
												);
											}

											const found = catalogoEstados.find(
												(c) =>
													c.id_estado_expediente ===
													newExp?.id_ultimo_estado_expediente
											);
											if (found)
												setExp({
													...newExp,
													ultimo_estado_nombre: found.nombre,
													departamento_nombre,
													municipio_nombre,
												});
											else
												setExp({
													...newExp,
													departamento_nombre,
													municipio_nombre,
												});
											setMotivoRechazo("");
											setShowMotivo(false);
											setSnackbarMsg("Estado actualizado correctamente");
											setSnackbarSeverity("success");
											setSnackbarOpen(true);
										} catch (err) {
											console.error("Error cambiando estado", err);
											setSnackbarMsg("Error al cambiar estado");
											setSnackbarSeverity("error");
											setSnackbarOpen(true);
										} finally {
											setChanging(false);
										}
									}}
									disabled={
										changing ||
										selectedEstado === exp?.id_ultimo_estado_expediente
									}
								>
									Cambiar estado
								</Button>
							</Stack>
						</div>
						<Box sx={{ mt: 2 }}>
							<Timeline>
								{estados.map((s: any, idx: number) => {
									const estadoNombre =
										catalogoEstados.find(
											(c) => c.id_estado_expediente === s.id_estado_expediente
										)?.nombre || String(s.id_estado_expediente);
									return (
										<TimelineItem key={s.id_expediente_estado || idx}>
											<TimelineOppositeContent sx={{ m: "auto 0" }}>
												<Typography variant="caption" color="text.secondary">
													{formatDate(s.fecha_registro)}
												</Typography>
											</TimelineOppositeContent>
											<TimelineSeparator>
												<TimelineDot color="primary" />
												{idx < estados.length - 1 && <TimelineConnector />}
											</TimelineSeparator>
											<TimelineContent sx={{ py: "12px", px: 2 }}>
												<Paper elevation={1} sx={{ p: 1.5 }}>
													<Stack direction="column" spacing={1}>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																gap: 1,
															}}
														>
															<Chip
																label={estadoNombre}
																size="small"
																color="primary"
															/>
														</Box>
														{s.motivo_rechazo && (
															<Typography
																variant="body2"
																color="text.secondary"
																sx={{
																	whiteSpace: "pre-wrap",
																	wordBreak: "break-word",
																	overflowWrap: "anywhere",
																}}
															>
																{s.motivo_rechazo}
															</Typography>
														)}
													</Stack>
													{s.id_usuario_registro && (
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Registrado por:{" "}
															{userNames[s.id_usuario_registro] ??
																s.id_usuario_registro}
														</Typography>
													)}
												</Paper>
											</TimelineContent>
										</TimelineItem>
									);
								})}
							</Timeline>
						</Box>
						<Snackbar
							open={snackbarOpen}
							autoHideDuration={4000}
							onClose={() => setSnackbarOpen(false)}
						>
							<Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
								{snackbarMsg}
							</Alert>
						</Snackbar>
					</div>
				)}
			</div>
		</div>
	);
}
