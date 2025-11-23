import { Request, Response, NextFunction } from "express";
import indiciosService, { IndiciosService } from "../services/indicios.service";
import expedientesService from "../services/expedientes.service";
import catalogsService from "../services/catalogs.service";
import { isTecnico } from "../utils/roles";

export class IndicioController {
	private service: IndiciosService;

	constructor(service: IndiciosService = indiciosService) {
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
				numero_indicio,
				descripcion,
				id_tipo_indicio,
				tipo,
				color,
				tamano,
				peso,
				ubicacion,
				observacion,
				id_usuario_registro,
				id_usuario_actualizacion,
				estado_registro,
			} = req.body as any;

			if (
				!id_expediente ||
				!numero_indicio ||
				!descripcion ||
				!id_usuario_registro
			) {
				res.status(400).json({
					message:
						"Faltan campos requeridos: id_expediente, numero_indicio, descripcion, id_usuario_registro",
				});
				return;
			}

			const tokenUser = (req as any).user;
			const tecnico = isTecnico(tokenUser);

			if (tecnico) {
				const exp = await expedientesService.obtenerExpediente(
					Number(id_expediente)
				);
				if (!exp) {
					res.status(404).json({ message: "Expediente no encontrado" });
					return;
				}
				if (Number(exp.id_usuario_registro) !== Number(tokenUser?.id_usuario)) {
					res.status(403).json({
						message: "No tiene permiso para agregar indicios a este expediente",
					});
					return;
				}
				let registradoId = 1;
				let rechazadoId: number | null = null;
				try {
					const cats = await catalogsService.listarEstados();
					const found = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "registrado"
					);
					if (found && found.id_estado_expediente)
						registradoId = Number(found.id_estado_expediente);
					const fr = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "rechazado"
					);
					if (fr && fr.id_estado_expediente)
						rechazadoId = Number(fr.id_estado_expediente);
				} catch (e) {}
				const current = Number(exp.id_ultimo_estado_expediente);
				const allowed = [registradoId];
				if (rechazadoId) allowed.push(rechazadoId);
				if (!allowed.includes(current)) {
					res.status(403).json({
						message:
							"No se pueden agregar indicios en el estado actual del expediente",
					});
					return;
				}
			}

			const payload = {
				id_expediente: Number(id_expediente),
				numero_indicio: Number(numero_indicio),
				descripcion,
				id_tipo_indicio: id_tipo_indicio ? Number(id_tipo_indicio) : null,
				tipo: tipo ?? null,
				color: color ?? null,
				tamano: tamano ?? null,
				peso: peso ?? null,
				ubicacion: ubicacion ?? null,
				observacion: observacion ?? null,
				id_usuario_registro: tecnico
					? Number(tokenUser?.id_usuario)
					: Number(id_usuario_registro),
				id_usuario_actualizacion: id_usuario_actualizacion
					? Number(id_usuario_actualizacion)
					: null,
				estado_registro: estado_registro ?? 1,
			};

			const result = await this.service.crearIndicio(payload);
			res.status(201).json({ message: "Indicio creado", data: result });
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
			const row = await this.service.obtenerIndicio(id);
			if (!row) {
				res.status(404).json({ message: "Indicio no encontrado" });
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
			const tokenUser = (req as any).user;
			const tecnico = isTecnico(tokenUser);

			if (tecnico) {
				const indicio = await this.service.obtenerIndicio(id);
				if (!indicio) {
					res.status(404).json({ message: "Indicio no encontrado" });
					return;
				}
				const exp = await expedientesService.obtenerExpediente(
					Number(indicio.id_expediente)
				);
				if (!exp) {
					res
						.status(404)
						.json({ message: "Expediente asociado no encontrado" });
					return;
				}
				if (Number(exp.id_usuario_registro) !== Number(tokenUser?.id_usuario)) {
					res
						.status(403)
						.json({ message: "No tiene permiso para editar este indicio" });
					return;
				}
				let registradoId = 1;
				let rechazadoId: number | null = null;
				try {
					const cats = await catalogsService.listarEstados();
					const found = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "registrado"
					);
					if (found && found.id_estado_expediente)
						registradoId = Number(found.id_estado_expediente);
					const fr = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "rechazado"
					);
					if (fr && fr.id_estado_expediente)
						rechazadoId = Number(fr.id_estado_expediente);
				} catch (e) {}
				const current = Number(exp.id_ultimo_estado_expediente);
				const allowed = [registradoId];
				if (rechazadoId) allowed.push(rechazadoId);
				if (!allowed.includes(current)) {
					res.status(403).json({
						message:
							"No se pueden editar indicios cuando el expediente no está en estado Registrado o Rechazado",
					});
					return;
				}
			}

			const updated = await this.service.actualizarIndicio(id, payload);
			res.status(200).json({ message: "Indicio actualizado", data: updated });
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
			const tokenUser = (req as any).user;
			const tecnico = isTecnico(tokenUser);

			if (tecnico) {
				const indicio = await this.service.obtenerIndicio(id);
				if (!indicio) {
					res.status(404).json({ message: "Indicio no encontrado" });
					return;
				}
				const exp = await expedientesService.obtenerExpediente(
					Number(indicio.id_expediente)
				);
				if (!exp) {
					res
						.status(404)
						.json({ message: "Expediente asociado no encontrado" });
					return;
				}
				if (Number(exp.id_usuario_registro) !== Number(tokenUser?.id_usuario)) {
					res
						.status(403)
						.json({ message: "No tiene permiso para eliminar este indicio" });
					return;
				}
				let registradoId = 1;
				let rechazadoId: number | null = null;
				try {
					const cats = await catalogsService.listarEstados();
					const found = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "registrado"
					);
					if (found && found.id_estado_expediente)
						registradoId = Number(found.id_estado_expediente);
					const fr = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "rechazado"
					);
					if (fr && fr.id_estado_expediente)
						rechazadoId = Number(fr.id_estado_expediente);
				} catch (e) {}
				const current = Number(exp.id_ultimo_estado_expediente);
				const allowed = [registradoId];
				if (rechazadoId) allowed.push(rechazadoId);
				if (!allowed.includes(current)) {
					res.status(403).json({
						message:
							"No se pueden eliminar indicios cuando el expediente no está en estado Registrado o Rechazado",
					});
					return;
				}
			}

			const ok = await this.service.eliminarIndicio(id, idUsuarioActualizacion);
			if (!ok) {
				res
					.status(404)
					.json({ message: "Indicio no encontrado o no eliminado" });
				return;
			}
			res.status(200).json({ message: "Indicio eliminado (soft delete)" });
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
				res.status(400).json({ message: "ID inválido" });
				return;
			}
			const rows = await this.service.listarPorExpediente(id);
			res.status(200).json({ data: rows });
		} catch (error) {
			return next(error);
		}
	}
}

export default new IndicioController();
