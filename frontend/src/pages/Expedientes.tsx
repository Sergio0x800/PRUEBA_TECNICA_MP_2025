import React, { useEffect, useState } from "react";
import { listarExpedientesPorUsuario } from "../services/expedientes";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
	Box,
	Button,
	Paper,
	Typography,
	Stack,
	IconButton,
	Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

export default function Expedientes() {
	const [rows, setRows] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const user = localStorage.getItem("user")
					? JSON.parse(localStorage.getItem("user") as string)
					: null;
				if (!user || !user.id_usuario) {
					setError("Usuario no identificado");
					return;
				}
				const isCoordinador =
					Array.isArray(user?.roles) &&
					user.roles.some((r: any) => {
						const name =
							typeof r === "string"
								? r
								: r?.nombre || r?.name || r?.nombre_rol || "";
						return String(name).toLowerCase() === "coordinador";
					});
				const data = isCoordinador
					? await (
							await import("../services/expedientes")
					  ).listarTodosExpedientes()
					: await listarExpedientesPorUsuario(user.id_usuario);
				const normalized = (data || []).map((r: any) => ({
					...r,
					id: r.id_expediente,
					ultimo_estado_nombre:
						(r &&
							(r.ultimo_estado_nombre ??
								r.ultimoEstadoNombre ??
								r.ultimo_estado ??
								r.ultimo_estado_name)) ??
						"",
				}));
				setRows(normalized);
			} catch (err: any) {
				setError(err?.message || "Error cargando expedientes");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	const columns: GridColDef[] = [
		{
			field: "codigo_expediente",
			headerName: "Código",
			flex: 1,
			minWidth: 150,
		},
		{ field: "descripcion", headerName: "Descripción", flex: 2, minWidth: 200 },
		{ field: "fecha_hecho", headerName: "Fecha hecho", width: 150 },
		{ field: "fecha_registro", headerName: "Fecha registro", width: 180 },
		{
			field: "ultimo_estado_nombre",
			headerName: "Último estado",
			width: 160,
			renderCell: (params: any) => {
				const val =
					params?.row?.ultimo_estado_nombre ??
					params?.row?.id_ultimo_estado_expediente ??
					params?.value ??
					"";
				return String(val ?? "");
			},
		},
		{
			field: "acciones",
			headerName: "Acciones",
			width: 150,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams) => {
				const id = params.row.id_expediente ?? params.row.id;
				const onView = () => navigate(`/app/expedientes/${id}`);
				const onEdit = () => navigate(`/app/expedientes/${id}/editar`);
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
				const isCoordinadorLocal =
					Array.isArray(user?.roles) &&
					user.roles.some((r: any) => {
						const name =
							typeof r === "string"
								? r
								: r?.nombre || r?.name || r?.nombre_rol || "";
						return String(name).toLowerCase() === "coordinador";
					});
				const ultimoNombre = String(
					params.row.ultimo_estado_nombre ||
						params.row.id_ultimo_estado_expediente ||
						""
				).toLowerCase();
				const canEdit =
					(!isTecnico && !isCoordinadorLocal) ||
					(isTecnico && ultimoNombre === "registrado");
				return (
					<Stack direction="row" spacing={1}>
						<Tooltip title="Ver detalle">
							<IconButton size="small" color="primary" onClick={onView}>
								<VisibilityIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={canEdit ? "Editar" : "No disponible"}>
							<IconButton
								size="small"
								color="inherit"
								onClick={onEdit}
								disabled={!canEdit}
							>
								<EditIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				);
			},
		},
	];

	return (
		<Paper sx={{ p: 2 }} elevation={1}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 2 }}
			>
				<Stack direction="row" spacing={1} alignItems="center">
					<Typography variant="h6">Expedientes</Typography>
					<Typography variant="body2" color="text.secondary">
						Listado de expedientes asignados
					</Typography>
				</Stack>
				<Stack direction="row" spacing={1}>
					<Button
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={() => navigate("/app/expedientes/nuevo")}
						disabled={(() => {
							const u = localStorage.getItem("user")
								? JSON.parse(localStorage.getItem("user") as string)
								: null;
							if (!u) return false;
							return (
								Array.isArray(u.roles) &&
								u.roles.some((r: any) => {
									const name =
										typeof r === "string"
											? r
											: r?.nombre || r?.name || r?.nombre_rol || "";
									return String(name).toLowerCase() === "coordinador";
								})
							);
						})()}
					>
						Nuevo expediente
					</Button>
				</Stack>
			</Stack>

			{loading && <div>Cargando...</div>}
			{error && <div style={{ color: "red" }}>{error}</div>}

			{!loading && !error && (
				<Box sx={{ width: "100%" }}>
					<DataGrid
						rows={rows}
						columns={columns}
						loading={loading}
						disableRowSelectionOnClick
						autoHeight
						initialState={{
							pagination: { paginationModel: { pageSize: 10, page: 0 } },
						}}
						pageSizeOptions={[10, 25, 50]}
					/>
				</Box>
			)}
		</Paper>
	);
}
