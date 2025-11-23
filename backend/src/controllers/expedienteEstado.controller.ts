import { Request, Response, NextFunction } from "express";
import expedienteEstadoService, {
	ExpedienteEstadoService,
} from "../services/expedienteEstado.service";
import expedientesService from "../services/expedientes.service";
import catalogsService from "../services/catalogs.service";
import { isTecnico, isCoordinador } from "../utils/roles";

export class ExpedienteEstadoController {
	private service: ExpedienteEstadoService;

	constructor(service: ExpedienteEstadoService = expedienteEstadoService) {
		this.service = service;
	}

	public async crear(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const {
				id_expediente,
				id_estado_expediente,
				id_coordinador_revision,
				motivo_rechazo,
				id_usuario_registro,
				estado_registro,
			} = req.body as any;

			if (
				!id_expediente ||
				!id_estado_expediente ||
				!id_coordinador_revision ||
				!id_usuario_registro
			) {
				res.status(400).json({
					message:
						"Faltan campos requeridos: id_expediente, id_estado_expediente, id_coordinador_revision, id_usuario_registro",
				});
				return;
			}

			const tokenUser = (req as any).user;
			const tecnico = isTecnico(tokenUser);
			const coordinador = isCoordinador(tokenUser);

			const payload = {
				id_expediente: Number(id_expediente),
				id_estado_expediente: Number(id_estado_expediente),
				id_coordinador_revision: Number(id_coordinador_revision),
				motivo_rechazo: motivo_rechazo ?? null,
				id_usuario_registro: tecnico
					? Number(tokenUser?.id_usuario)
					: Number(id_usuario_registro),
				estado_registro: estado_registro ?? 1,
			};

			if (tecnico) {
				const exp = await expedientesService.obtenerExpediente(
					payload.id_expediente
				);
				if (!exp) {
					res.status(404).json({ message: "Expediente no encontrado" });
					return;
				}
				if (Number(exp.id_usuario_registro) !== Number(tokenUser?.id_usuario)) {
					res.status(403).json({
						message:
							"No tiene permiso para cambiar el estado de este expediente",
					});
					return;
				}

				let registradoId = 1;
				let enRevisionId: number | null = null;
				let rechazadoId: number | null = null;
				try {
					const cats = await catalogsService.listarEstados();
					const reg = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "registrado"
					);
					const rev = cats.find(
						(c: any) =>
							String(c.nombre).toLowerCase() === "en revisión" ||
							String(c.nombre).toLowerCase() === "en revision"
					);
					const rech = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "rechazado"
					);
					if (reg && reg.id_estado_expediente)
						registradoId = Number(reg.id_estado_expediente);
					if (rev && rev.id_estado_expediente)
						enRevisionId = Number(rev.id_estado_expediente);
					if (rech && rech.id_estado_expediente)
						rechazadoId = Number(rech.id_estado_expediente);
				} catch (e) {}
				const currentEstado = Number(exp.id_ultimo_estado_expediente);
				const allowedFrom = [registradoId];
				if (rechazadoId) allowedFrom.push(rechazadoId);
				if (!allowedFrom.includes(currentEstado)) {
					res.status(403).json({
						message:
							"Solo se puede cambiar estado desde Registrado o Rechazado",
					});
					return;
				}
				if (!enRevisionId) {
					res.status(400).json({
						message:
							'No se pudo determinar el id de estado "En revisión" en catálogo',
					});
					return;
				}
				if (Number(payload.id_estado_expediente) !== enRevisionId) {
					res.status(403).json({
						message: 'Técnico solo puede cambiar el estado a "En revisión"',
					});
					return;
				}
			}

			if (coordinador) {
				const exp = await expedientesService.obtenerExpediente(
					Number(payload.id_expediente)
				);
				if (!exp) {
					res.status(404).json({ message: "Expediente no encontrado" });
					return;
				}
				let registradoId = 1;
				let enRevisionId: number | null = null;
				let aprobadoId: number | null = null;
				let rechazadoId: number | null = null;
				let archivadoId: number | null = null;
				try {
					const cats = await catalogsService.listarEstados();
					for (const c of cats) {
						const n = String(c.nombre || "").toLowerCase();
						if (n === "registrado")
							registradoId = Number(c.id_estado_expediente);
						if (n === "en revisión" || n === "en revision")
							enRevisionId = Number(c.id_estado_expediente);
						if (n === "aprobado") aprobadoId = Number(c.id_estado_expediente);
						if (n === "rechazado") rechazadoId = Number(c.id_estado_expediente);
						if (n === "archivado") archivadoId = Number(c.id_estado_expediente);
					}
				} catch (e) {}
				const current = Number(exp.id_ultimo_estado_expediente);
				const target = Number(payload.id_estado_expediente);
				const allowedTargets: number[] = [];
				if (enRevisionId && current === enRevisionId) {
					if (aprobadoId) allowedTargets.push(aprobadoId);
					if (rechazadoId) allowedTargets.push(rechazadoId);
					if (archivadoId) allowedTargets.push(archivadoId);
				} else if (rechazadoId && current === rechazadoId) {
					if (enRevisionId) allowedTargets.push(enRevisionId);
				} else if (aprobadoId && current === aprobadoId) {
					if (archivadoId) allowedTargets.push(archivadoId);
				} else {
					res.status(403).json({
						message: "No puede cambiar estado en la situación actual",
					});
					return;
				}
				if (!allowedTargets.includes(target)) {
					res.status(403).json({
						message: "Transición de estado no permitida para Coordinador",
					});
					return;
				}
				const motivo = String(payload.motivo_rechazo || "").trim();
				if (target === rechazadoId && (!motivo || motivo.length === 0)) {
					res
						.status(400)
						.json({ message: "Motivo de rechazo requerido al rechazar" });
					return;
				}
			}

			const result = await this.service.crearEstado(payload);
			res
				.status(201)
				.json({ message: "Expediente estado creado", data: result });
		} catch (error) {
			return next(error);
		}
	}

	public async obtener(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const id = Number(req.params.id);
			if (!id) {
				res.status(400).json({ message: "ID inválido" });
				return;
			}
			const row = await this.service.obtenerEstado(id);
			if (!row) {
				res.status(404).json({ message: "Expediente estado no encontrado" });
				return;
			}
			res.status(200).json({ data: row });
		} catch (error) {
			return next(error);
		}
	}

	public async actualizar(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const id = Number(req.params.id);
			if (!id) {
				res.status(400).json({ message: "ID inválido" });
				return;
			}
			const payload = req.body as any;
			const updated = await this.service.actualizarEstado(id, payload);
			res
				.status(200)
				.json({ message: "Expediente estado actualizado", data: updated });
		} catch (error) {
			return next(error);
		}
	}

	public async eliminar(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const id = Number(req.params.id);
			if (!id) {
				res.status(400).json({ message: "ID inválido" });
				return;
			}
			const idUsuarioActualizacion = req.body?.id_usuario_actualizacion
				? Number(req.body.id_usuario_actualizacion)
				: undefined;
			const ok = await this.service.eliminarEstado(id, idUsuarioActualizacion);
			if (!ok) {
				res
					.status(404)
					.json({ message: "Expediente estado no encontrado o no eliminado" });
				return;
			}
			res
				.status(200)
				.json({ message: "Expediente estado eliminado (soft delete)" });
		} catch (error) {
			return next(error);
		}
	}

	public async listarPorExpediente(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const id = Number(req.params.id);
			if (!id) {
				res.status(400).json({ message: "ID de expediente inválido" });
				return;
			}
			const rows = await this.service.listarPorExpediente(id);
			res.status(200).json({ data: rows });
		} catch (error) {
			return next(error);
		}
	}
}

export default new ExpedienteEstadoController();
