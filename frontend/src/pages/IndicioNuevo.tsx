import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	crearIndicio,
	listarTiposIndicio,
	obtenerIndicio,
	actualizarIndicio,
} from "../services/expedientes";
import { useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Card,
	CardContent,
	Stack,
	Snackbar,
	Alert,
} from "@mui/material";

export default function IndicioNuevo() {
	const params = useParams();
	const idExp = params.id ? Number(params.id) : null;
	const idInd = params.idInd ? Number(params.idInd) : null;
	const navigate = useNavigate();

	const [numero, setNumero] = useState<number | "">("");
	const [descripcion, setDescripcion] = useState("");
	const [tipo, setTipo] = useState<number | "">("");
	const [tipoOptions, setTipoOptions] = useState<
		Array<{ value: number; label: string }>
	>([]);
	const [color, setColor] = useState("");
	const [tamano, setTamano] = useState("");
	const [peso, setPeso] = useState("");
	const [ubicacion, setUbicacion] = useState("");
	const [observacion, setObservacion] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [canOperate, setCanOperate] = useState<boolean>(true);
	const [snackOpen, setSnackOpen] = useState(false);
	const [snackMsg, setSnackMsg] = useState("");
	const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
		"success"
	);

	useEffect(() => {
		async function loadTipos() {
			try {
				const rows = await listarTiposIndicio();
				const opts = (rows || []).map((r: any) => ({
					value: r.id_tipo_indicio,
					label: r.nombre,
				}));
				setTipoOptions(opts);
			} catch (err) {
				console.warn("No se pudieron cargar tipos de indicio", err);
			}
		}
		loadTipos();
	}, []);

	useEffect(() => {
		async function loadExisting() {
			if (!idInd) return;
			try {
				const row = await obtenerIndicio(idInd);
				if (!row) return;
				setNumero(row.numero_indicio ?? "");
				setDescripcion(row.descripcion ?? "");
				setTipo(
					row.id_tipo_indicio !== null &&
						typeof row.id_tipo_indicio !== "undefined"
						? Number(row.id_tipo_indicio)
						: ""
				);
				setColor(row.color ?? "");
				setTamano(row.tamano ?? "");
				setPeso(row.peso ?? "");
				setUbicacion(row.ubicacion ?? "");
				setObservacion(row.observacion ?? "");
			} catch (err) {
				console.warn("No se pudo cargar indicio", err);
			}
		}

		loadExisting();
	}, [idInd]);

	useEffect(() => {
		async function checkPerms() {
			if (!idExp) return setCanOperate(true);
			try {
				const exp = await (
					await import("../services/expedientes")
				).obtenerExpediente(idExp);
				const user = localStorage.getItem("user")
					? JSON.parse(localStorage.getItem("user") as string)
					: null;
				const isTecnico =
					Array.isArray(user?.roles) &&
					user.roles.some((r: any) => {
						const name =
							typeof r === "string"
								? r
								: r?.nombre || r?.name || r?.nombre_rol || "";
						return String(name).toLowerCase() === "tecnico";
					});
				const isCoordinador =
					Array.isArray(user?.roles) &&
					user.roles.some((r: any) => {
						const name =
							typeof r === "string"
								? r
								: r?.nombre || r?.name || r?.nombre_rol || "";
						return String(name).toLowerCase() === "coordinador";
					});
				if (isCoordinador) return setCanOperate(false);
				if (!isTecnico) return setCanOperate(true);
				const estadoNombre = String(
					exp?.ultimo_estado_nombre || exp?.id_ultimo_estado_expediente || ""
				).toLowerCase();
				const okEstado =
					estadoNombre === "registrado" ||
					estadoNombre === "rechazado" ||
					Number(exp?.id_ultimo_estado_expediente) === 1;
				const okOwner =
					Number(exp?.id_usuario_registro) === Number(user?.id_usuario);
				setCanOperate(Boolean(okEstado && okOwner));
			} catch (e) {
				console.warn("No se pudo validar permisos de indicio", e);
				setCanOperate(true);
			}
		}

		checkPerms();
	}, [idExp]);

	const isValid = numero !== "" && descripcion.trim() !== "";

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!idExp) return;
		if (!isValid) {
			setError("Complete los campos obligatorios");
			setSnackMsg("Complete los campos obligatorios");
			setSnackSeverity("error");
			setSnackOpen(true);
			return;
		}
		setLoading(true);
		try {
			const user = localStorage.getItem("user")
				? JSON.parse(localStorage.getItem("user") as string)
				: null;
			const payload: any = {
				id_expediente: idExp,
				numero_indicio: Number(numero),
				descripcion,
				id_tipo_indicio: tipo === "" ? null : Number(tipo),
				tipo:
					tipo === ""
						? null
						: tipoOptions.find((t) => t.value === tipo)?.label ?? null,
				color: color || null,
				tamano: tamano || null,
				peso: peso || null,
				ubicacion: ubicacion || null,
				observacion: observacion || null,
				id_usuario_registro: user?.id_usuario ?? null,
			};
			if (idInd) {
				await actualizarIndicio(idInd, payload);
				setSnackMsg("Indicio actualizado");
			} else {
				await crearIndicio(payload);
				setSnackMsg("Indicio creado");
			}
			setSnackSeverity("success");
			setSnackOpen(true);
			setTimeout(() => navigate(`/app/expedientes/${idExp}`), 700);
		} catch (err: any) {
			setError(err?.message || "Error creando indicio");
			setSnackMsg(
				err?.message ||
					(idInd ? "Error actualizando indicio" : "Error creando indicio")
			);
			setSnackSeverity("error");
			setSnackOpen(true);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box>
			<Paper
				sx={{ p: 2 }}
				component="form"
				onSubmit={handleSubmit}
				elevation={1}
			>
				<Box
					sx={{
						display: "flex",
						gap: 2,
						flexDirection: { xs: "column", sm: "row" },
					}}
				>
					<Box sx={{ flex: 1 }}>
						<Typography variant="h6" gutterBottom>
							{idInd
								? `Editar indicio para expediente ${idExp}`
								: `Nuevo indicio ${idExp ? `para expediente ${idExp}` : ""}`}
						</Typography>

						<Stack spacing={2}>
							<TextField
								label="Número"
								type="number"
								value={numero as any}
								onChange={(e) =>
									setNumero(e.target.value ? Number(e.target.value) : "")
								}
								required
								fullWidth
							/>

							<TextField
								label="Descripción"
								value={descripcion}
								onChange={(e) => setDescripcion(e.target.value)}
								required
								fullWidth
								multiline
								minRows={3}
							/>

							<FormControl fullWidth>
								<InputLabel id="tipo-label">Tipo</InputLabel>
								<Select
									labelId="tipo-label"
									value={tipo}
									label="Tipo"
									onChange={(e) => {
										const raw = e.target.value as unknown as string;
										setTipo(raw === "" ? "" : Number(raw));
									}}
								>
									<MenuItem value="">-- Sin especificar --</MenuItem>
									{tipoOptions.map((t) => (
										<MenuItem key={t.value} value={t.value}>
											{t.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<TextField
								label="Color"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								fullWidth
							/>

							<TextField
								label="Tamaño"
								value={tamano}
								onChange={(e) => setTamano(e.target.value)}
								fullWidth
							/>

							<TextField
								label="Peso"
								value={peso}
								onChange={(e) => setPeso(e.target.value)}
								fullWidth
							/>

							<TextField
								label="Ubicación"
								value={ubicacion}
								onChange={(e) => setUbicacion(e.target.value)}
								fullWidth
							/>

							<TextField
								label="Observación"
								value={observacion}
								onChange={(e) => setObservacion(e.target.value)}
								fullWidth
								multiline
								minRows={2}
							/>

							{error && <Typography color="error">{error}</Typography>}

							<Stack direction="row" spacing={1}>
								<Button
									variant="contained"
									color="primary"
									type="submit"
									disabled={loading || !isValid || !canOperate}
								>
									{loading
										? idInd
											? "Guardando..."
											: "Guardando..."
										: idInd
										? "Guardar cambios"
										: "Guardar"}
								</Button>
								<Button
									variant="outlined"
									onClick={() => navigate(`/app/expedientes/${idExp}`)}
								>
									Cancelar
								</Button>
							</Stack>
							{!canOperate && (
								<Typography color="error" sx={{ mt: 1 }}>
									No tiene permiso para crear o editar indicios en este
									expediente.
								</Typography>
							)}
						</Stack>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: 320 } }}>
						<Card variant="outlined">
							<CardContent>
								<Typography variant="subtitle1" gutterBottom>
									Vista previa
								</Typography>
								<Typography variant="body2">
									<strong>Número:</strong> {numero || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Tipo:</strong>{" "}
									{tipoOptions.find((t) => t.value === tipo)?.label || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Descripción:</strong> {descripcion || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Color:</strong> {color || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Tamaño:</strong> {tamano || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Peso:</strong> {peso || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Ubicación:</strong> {ubicacion || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Observación:</strong> {observacion || "—"}
								</Typography>
							</CardContent>
						</Card>
					</Box>
				</Box>
			</Paper>

			<Snackbar
				open={snackOpen}
				autoHideDuration={3000}
				onClose={() => setSnackOpen(false)}
			>
				<Alert severity={snackSeverity} sx={{ width: "100%" }}>
					{snackMsg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
