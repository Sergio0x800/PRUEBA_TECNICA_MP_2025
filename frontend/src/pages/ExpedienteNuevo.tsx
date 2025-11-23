import React, { useEffect, useState } from "react";
import {
	crearExpediente,
	listarDepartamentos,
	listarMunicipios,
	obtenerExpediente,
	actualizarExpediente,
} from "../services/expedientes";
import { useNavigate, useParams } from "react-router-dom";
import {
	Box,
	Button,
	TextField,
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Card,
	CardContent,
	Stack,
	Snackbar,
	Alert,
} from "@mui/material";

export default function ExpedienteNuevo() {
	const [codigo, setCodigo] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [idDepartamento, setIdDepartamento] = useState<number | "">("");
	const [idMunicipio, setIdMunicipio] = useState<number | "">("");
	const [fechaHecho, setFechaHecho] = useState("");
	const [departamentos, setDepartamentos] = useState<any[]>([]);
	const [municipios, setMunicipios] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [snackOpen, setSnackOpen] = useState(false);
	const [snackMsg, setSnackMsg] = useState("");
	const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
		"success"
	);

	const navigate = useNavigate();
	const params = useParams();
	const editingId = params.id ? Number(params.id) : null;

	useEffect(() => {
		async function loadExisting() {
			if (!editingId) return;
			try {
				const row = await obtenerExpediente(editingId);
				if (row) {
					setCodigo(row.codigo_expediente || "");
					setDescripcion(row.descripcion || "");
					setIdDepartamento(row.id_departamento ?? "");
					setIdMunicipio(row.id_municipio ?? "");
					setFechaHecho(row.fecha_hecho ? row.fecha_hecho.split("T")[0] : "");
				}
			} catch (err) {
				console.warn("No se pudo cargar expediente existente", err);
			}
		}
		loadExisting();
	}, [editingId]);

	useEffect(() => {
		async function load() {
			try {
				const deps = await listarDepartamentos();
				setDepartamentos(deps);
			} catch (err) {
				console.warn("No se pudieron cargar departamentos", err);
			}
		}
		load();
	}, []);

	useEffect(() => {
		async function loadM() {
			if (!idDepartamento) {
				setMunicipios([]);
				return;
			}
			try {
				const mus = await listarMunicipios(Number(idDepartamento));
				setMunicipios(mus);
			} catch (err) {
				console.warn("No se pudieron cargar municipios", err);
			}
		}
		loadM();
	}, [idDepartamento]);

	const isValid =
		codigo.trim() !== "" && idDepartamento !== "" && idMunicipio !== "";

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!isValid) {
			setError("Complete los campos obligatorios");
			setSnackMsg("Complete los campos obligatorios");
			setSnackSeverity("error");
			setSnackOpen(true);
			return;
		}
		setError(null);
		setLoading(true);
		try {
			const user = localStorage.getItem("user")
				? JSON.parse(localStorage.getItem("user") as string)
				: null;
			const isCoordinador =
				Array.isArray(user?.roles) &&
				user.roles.some((r: any) => {
					const name =
						typeof r === "string"
							? r
							: r?.nombre || r?.name || r?.nombre_rol || "";
					return String(name).toLowerCase() === "coordinador";
				});
			if (isCoordinador) {
				setError("Coordinador no puede crear o editar expedientes");
				setSnackMsg("Coordinador no puede crear o editar expedientes");
				setSnackSeverity("error");
				setSnackOpen(true);
				setLoading(false);
				return;
			}
			const payload: any = {
				codigo_expediente: codigo,
				descripcion,
				id_departamento: idDepartamento ? Number(idDepartamento) : null,
				id_municipio: idMunicipio ? Number(idMunicipio) : null,
				fecha_hecho: fechaHecho || null,
				id_usuario_registro: user?.id_usuario ?? null,
				id_usuario_actualizacion: user?.id_usuario ?? null,
			};
			if (editingId) {
				await actualizarExpediente(editingId, payload);
				setSnackMsg("Expediente actualizado");
			} else {
				await crearExpediente(payload);
				setSnackMsg("Expediente creado");
			}
			setSnackSeverity("success");
			setSnackOpen(true);
			setTimeout(() => navigate("/app/expedientes"), 800);
		} catch (err: any) {
			setError(err?.message || "Error creando expediente");
			setSnackMsg(err?.message || "Error creando expediente");
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
				elevation={1}
				component="form"
				onSubmit={handleSubmit}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						gap: 2,
						alignItems: "flex-start",
					}}
				>
					<Box sx={{ width: { xs: "100%", sm: "66.666%" } }}>
						<Typography variant="h6" gutterBottom>
							{editingId ? "Editar expediente" : "Nuevo expediente"}
						</Typography>

						<Stack spacing={2}>
							<TextField
								label="Código"
								value={codigo}
								onChange={(e) => setCodigo(e.target.value)}
								required
								fullWidth
								helperText="Código único del expediente"
							/>

							<TextField
								label="Descripción"
								value={descripcion}
								onChange={(e) => setDescripcion(e.target.value)}
								fullWidth
								multiline
								minRows={3}
							/>

							<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
								<Box sx={{ width: { xs: "100%", sm: "50%" } }}>
									<FormControl fullWidth required>
										<InputLabel id="dep-label">Departamento</InputLabel>
										<Select
											labelId="dep-label"
											value={idDepartamento}
											label="Departamento"
											onChange={(e) =>
												setIdDepartamento(
													e.target.value ? Number(e.target.value) : ""
												)
											}
										>
											<MenuItem value="">-- Seleccione --</MenuItem>
											{departamentos.map((d) => (
												<MenuItem
													key={d.id_departamento}
													value={d.id_departamento}
												>
													{d.nombre}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>

								<Box sx={{ width: { xs: "100%", sm: "50%" } }}>
									<FormControl fullWidth required>
										<InputLabel id="mun-label">Municipio</InputLabel>
										<Select
											labelId="mun-label"
											value={idMunicipio}
											label="Municipio"
											onChange={(e) =>
												setIdMunicipio(
													e.target.value ? Number(e.target.value) : ""
												)
											}
										>
											<MenuItem value="">-- Seleccione --</MenuItem>
											{municipios.map((m) => (
												<MenuItem key={m.id_municipio} value={m.id_municipio}>
													{m.nombre}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>
							</Box>

							<TextField
								label="Fecha del hecho"
								type="date"
								value={fechaHecho}
								onChange={(e) => setFechaHecho(e.target.value)}
								InputLabelProps={{ shrink: true }}
								sx={{ width: 220 }}
							/>

							{error && <Typography color="error">{error}</Typography>}

							<Stack direction="row" spacing={1}>
								<Button
									variant="contained"
									color="primary"
									type="submit"
									disabled={loading || !isValid}
								>
									{loading
										? "Guardando..."
										: editingId
										? "Guardar cambios"
										: "Guardar"}
								</Button>
								<Button
									variant="outlined"
									onClick={() => navigate("/app/expedientes")}
								>
									Cancelar
								</Button>
							</Stack>
						</Stack>
					</Box>

					<Box sx={{ width: { xs: "100%", sm: "33.333%" } }}>
						<Card variant="outlined">
							<CardContent>
								<Typography variant="subtitle1" gutterBottom>
									Vista previa
								</Typography>
								<Typography variant="body2">
									<strong>Código:</strong> {codigo || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Descripción:</strong> {descripcion || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Departamento:</strong>{" "}
									{departamentos.find(
										(d) => d.id_departamento === idDepartamento
									)?.nombre || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Municipio:</strong>{" "}
									{municipios.find((m) => m.id_municipio === idMunicipio)
										?.nombre || "—"}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									<strong>Fecha hecho:</strong> {fechaHecho || "—"}
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
