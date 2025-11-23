import React, { useEffect, useState } from "react";
import {
	Box,
	Typography,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Button,
	Stack,
	Alert,
	SelectChangeEvent,
} from "@mui/material";
import {
	obtenerReporteSummary,
	obtenerReporteTimeseries,
	exportSummaryToCSV,
} from "../services/expedientes";
import { listarCatalogoEstados } from "../services/expedientes";
import jsPDF from "jspdf";

export default function Reports() {
	const [estados, setEstados] = useState<any[]>([]);
	const [fechaInicio, setFechaInicio] = useState<string | null>(null);
	const [fechaFin, setFechaFin] = useState<string | null>(null);
	const [estadoSelected, setEstadoSelected] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<{
		type: "success" | "error" | "info";
		text: string;
	} | null>(null);

	const userJson =
		typeof window !== "undefined" ? localStorage.getItem("user") : null;
	let user: any = null;
	try {
		user = userJson ? JSON.parse(userJson) : null;
	} catch (e) {
		user = null;
	}
	const isCoordinador =
		Array.isArray(user?.roles) &&
		user.roles.some((r: any) => {
			const name =
				typeof r === "string" ? r : r?.nombre || r?.nombre_rol || r?.name || "";
			return (
				String(name).toLowerCase() === "coordinador" ||
				String(name).toLowerCase() === "admin"
			);
		});

	useEffect(() => {
		async function load() {
			try {
				const cats = await listarCatalogoEstados();
				setEstados(cats || []);
			} catch (e) {
				console.warn("No se pudieron cargar estados", e);
			}
		}
		load();
	}, []);

	if (!isCoordinador) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					Acceso denegado. Solo coordinadores pueden ver Reporteria.
				</Alert>
			</Box>
		);
	}

	function formatDateForPrint(d: string | null) {
		if (!d) return "-";
		return d;
	}

	async function handleGenerateSummaryPDF() {
		setLoading(true);
		setMsg(null);
		try {
			const res = await obtenerReporteSummary({
				fecha_inicio: fechaInicio,
				fecha_fin: fechaFin,
				id_estado: estadoSelected,
			});
			const doc = new jsPDF();
			doc.setFontSize(14);
			doc.text("Reporte - Resumen de Estados", 14, 20);
			doc.setFontSize(10);
			doc.text(
				`Fecha inicio: ${formatDateForPrint(
					fechaInicio
				)}    Fecha fin: ${formatDateForPrint(fechaFin)}`,
				14,
				28
			);
			let y = 36;
			doc.setFontSize(12);
			doc.text("Conteo por estado:", 14, y);
			y += 6;
			const counts = res.countsByEstado || [];
			if (counts.length === 0) {
				doc.setFontSize(10);
				doc.text("No se encontraron datos para esos filtros.", 14, y);
			} else {
				doc.setFontSize(10);
				for (const c of counts) {
					doc.text(`${c.nombre_estado}: ${c.cantidad}`, 16, y);
					y += 6;
					if (y > 270) {
						doc.addPage();
						y = 20;
					}
				}
			}
			y += 6;
			doc.setFontSize(11);
			doc.text(
				`Total expedientes creados: ${res.total_expedientes_creados || 0}`,
				14,
				y
			);
			doc.save(`reporte_summary_${Date.now()}.pdf`);
			setMsg({ type: "success", text: "PDF generado correctamente." });
		} catch (e: any) {
			console.error(e);
			setMsg({ type: "error", text: "Error generando reporte." });
		} finally {
			setLoading(false);
		}
	}

	async function handleGenerateTimeseriesPDF() {
		setLoading(true);
		setMsg(null);
		try {
			const res = await obtenerReporteTimeseries({
				fecha_inicio: fechaInicio,
				fecha_fin: fechaFin,
				id_estado: estadoSelected,
			});
			const doc = new jsPDF();
			doc.setFontSize(14);
			doc.text("Reporte - Series temporales", 14, 20);
			doc.setFontSize(10);
			doc.text(
				`Fecha inicio: ${formatDateForPrint(
					fechaInicio
				)}    Fecha fin: ${formatDateForPrint(fechaFin)}`,
				14,
				28
			);
			let y = 36;
			doc.setFontSize(12);
			doc.text("Transiciones por fecha:", 14, y);
			y += 6;
			const trans = res.transitions || [];
			if (trans.length === 0) {
				doc.setFontSize(10);
				doc.text("No se encontraron transiciones para esos filtros.", 14, y);
			} else {
				doc.setFontSize(9);
				doc.text("Fecha - Cantidad", 14, y);
				y += 6;
				for (const t of trans) {
					doc.text(`${t.fecha} - ${t.cantidad}`, 16, y);
					y += 5;
					if (y > 270) {
						doc.addPage();
						y = 20;
					}
				}
			}

			y += 8;
			doc.setFontSize(12);
			doc.text("Expedientes creados por fecha:", 14, y);
			y += 6;
			const regs = res.registros || [];
			if (regs.length === 0) {
				doc.setFontSize(10);
				doc.text("No se encontraron registros para esos filtros.", 14, y);
			} else {
				doc.setFontSize(9);
				doc.text("Fecha - Cantidad", 14, y);
				y += 6;
				for (const r of regs) {
					doc.text(`${r.fecha} - ${r.cantidad}`, 16, y);
					y += 5;
					if (y > 270) {
						doc.addPage();
						y = 20;
					}
				}
			}
			doc.save(`reporte_timeseries_${Date.now()}.pdf`);
			setMsg({ type: "success", text: "PDF generado correctamente." });
		} catch (e) {
			console.error(e);
			setMsg({ type: "error", text: "Error generando serie temporal." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box sx={{ p: 3 }}>
			<Paper sx={{ p: 2, mb: 2 }}>
				<Typography variant="h6">Reportería</Typography>
				<Typography variant="body2" color="text.secondary">
					Genera informes y estadísticas. Selecciona filtros y el tipo de
					reporte, luego presiona "Generar PDF". Los archivos se descargarán en
					formato PDF.
				</Typography>
			</Paper>

			<Paper sx={{ p: 2, mb: 2 }}>
				<Typography variant="subtitle1">Filtros</Typography>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					alignItems="center"
					sx={{ mt: 1 }}
				>
					<TextField
						label="Fecha inicio"
						type="date"
						InputLabelProps={{ shrink: true }}
						value={fechaInicio ?? ""}
						onChange={(e) => setFechaInicio(e.target.value || null)}
					/>
					<TextField
						label="Fecha fin"
						type="date"
						InputLabelProps={{ shrink: true }}
						value={fechaFin ?? ""}
						onChange={(e) => setFechaFin(e.target.value || null)}
					/>
					<FormControl size="small" sx={{ minWidth: 220 }}>
						<InputLabel id="estado-select-label">Estado (opcional)</InputLabel>
						<Select
							labelId="estado-select-label"
							value={estadoSelected ?? ""}
							label="Estado (opcional)"
							onChange={(e: SelectChangeEvent<any>) => {
								const v: any = e.target.value;
								if (v === "") setEstadoSelected(null);
								else setEstadoSelected(Number(v));
							}}
						>
							<MenuItem value="">-- Todos --</MenuItem>
							{estados.map((s) => (
								<MenuItem
									key={s.id_estado_expediente}
									value={s.id_estado_expediente}
								>
									{s.nombre}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</Paper>

			<Paper sx={{ p: 2, mb: 2 }}>
				<Typography variant="subtitle1">Tipos de reporte</Typography>
				<Box sx={{ mt: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						Resumen por estados
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Descripción: Muestra la cantidad de cambios de estado (aprobaciones,
						rechazos, etc.) en el rango seleccionado, y el total de expedientes
						creados en ese periodo. Útil para métricas rápidas y seguimiento.
					</Typography>
					<Box sx={{ mt: 1 }}>
						<Button
							variant="contained"
							onClick={handleGenerateSummaryPDF}
							disabled={loading}
						>
							Generar PDF (Resumen)
						</Button>
					</Box>
				</Box>

				<Box sx={{ mt: 2 }}>
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						Series temporales
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Descripción: Muestra la evolución diaria de las transiciones de
						estado y la creación de expedientes en el periodo seleccionado. Útil
						para ver tendencias y picos de actividad.
					</Typography>
					<Box sx={{ mt: 1 }}>
						<Button
							variant="contained"
							onClick={handleGenerateTimeseriesPDF}
							disabled={loading}
						>
							Generar PDF (Series)
						</Button>
					</Box>
				</Box>
			</Paper>

			{msg && (
				<Box sx={{ mb: 2 }}>
					<Alert severity={msg.type}>{msg.text}</Alert>
				</Box>
			)}
		</Box>
	);
}
