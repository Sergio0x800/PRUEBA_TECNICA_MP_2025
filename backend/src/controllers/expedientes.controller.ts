import { Request, Response, NextFunction } from "express";
import expedientesService, {
	ExpedientesService,
} from "../services/expedientes.service";
import catalogsService from "../services/catalogs.service";
import { isTecnico } from "../utils/roles";

export class ExpedienteController {
	private service: ExpedientesService;

	constructor(service: ExpedientesService = expedientesService) {
		this.service = service;
	}

	public async crear(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const {
				codigo_expediente,
				descripcion,
				id_departamento,
				id_municipio,
				fecha_hecho,
				id_usuario_registro,
				id_usuario_actualizacion,
				estado_registro,
			} = req.body as any;

			if (
				!codigo_expediente ||
				!id_departamento ||
				!id_municipio ||
				!id_usuario_registro
			) {
				res.status(400).json({
					message:
						"Faltan campos requeridos: codigo_expediente, id_departamento, id_municipio, id_usuario_registro",
				});
				return;
			}

			const tokenUser = (req as any).user;
			const tecnico = isTecnico(tokenUser);

			const payload = {
				codigo_expediente,
				descripcion: descripcion ?? null,
				id_departamento: Number(id_departamento),
				id_municipio: Number(id_municipio),
				fecha_hecho: fecha_hecho ?? null,
				id_usuario_registro: tecnico
					? Number(tokenUser?.id_usuario)
					: Number(id_usuario_registro),
				id_usuario_actualizacion: id_usuario_actualizacion
					? Number(id_usuario_actualizacion)
					: null,
				estado_registro: tecnico ? 1 : estado_registro ?? 1,
			};

			const result = await this.service.crearExpediente(payload as any);

			res
				.status(201)
				.json({ message: "Expediente creado exitosamente", data: result });
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

			const row = await this.service.obtenerExpediente(id);
			if (!row) {
				res.status(404).json({ message: "Expediente no encontrado" });
				return;
			}
			const tokenUser = (req as any).user;
			const tecnico = isTecnico(tokenUser);
			if (
				tecnico &&
				Number(row.id_usuario_registro) !== Number(tokenUser?.id_usuario)
			) {
				res
					.status(403)
					.json({ message: "No tiene permiso para ver este expediente" });
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
				const existing = await this.service.obtenerExpediente(id);
				if (!existing) {
					res.status(404).json({ message: "Expediente no encontrado" });
					return;
				}
				if (
					Number(existing.id_usuario_registro) !== Number(tokenUser?.id_usuario)
				) {
					res
						.status(403)
						.json({ message: "No tiene permiso para editar este expediente" });
					return;
				}
				let registradoId = 1;
				let rechazadoId: number | null = null;
				try {
					const cats = await catalogsService.listarEstados();
					const foundReg = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "registrado"
					);
					if (foundReg && foundReg.id_estado_expediente)
						registradoId = Number(foundReg.id_estado_expediente);
					const foundRech = cats.find(
						(c: any) => String(c.nombre).toLowerCase() === "rechazado"
					);
					if (foundRech && foundRech.id_estado_expediente)
						rechazadoId = Number(foundRech.id_estado_expediente);
				} catch (e) {}
				const currentEstado = Number(existing.id_ultimo_estado_expediente);
				const allowedEstados = [registradoId];
				if (rechazadoId) allowedEstados.push(rechazadoId);
				if (!allowedEstados.includes(currentEstado)) {
					res.status(403).json({
						message:
							"Solo se puede editar expediente en estado Registrado o Rechazado",
					});
					return;
				}

				if (
					typeof payload.id_ultimo_estado_expediente !== "undefined" ||
					typeof payload.estado_registro !== "undefined" ||
					typeof payload.id_estado_expediente !== "undefined"
				) {
					res.status(403).json({
						message:
							"No tiene permiso para cambiar el estado del expediente desde aquí",
					});
					return;
				}
			}

			const updated = await this.service.actualizarExpediente(id, payload);
			res
				.status(200)
				.json({ message: "Expediente actualizado", data: updated });
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
			const ok = await this.service.eliminarExpediente(
				id,
				idUsuarioActualizacion
			);
			if (!ok) {
				res
					.status(404)
					.json({ message: "Expediente no encontrado o no eliminado" });
				return;
			}
			res.status(200).json({ message: "Expediente eliminado (soft delete)" });
		} catch (error) {
			return next(error);
		}
	}
	public async listarPorUsuario(
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
			const rows = await this.service.listarPorUsuario(id as number);
			res.status(200).json({ data: rows });
		} catch (error) {
			return next(error);
		}
	}

	public async listarTodos(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const rows = await this.service.listarTodos();
			res.status(200).json({ data: rows });
		} catch (error) {
			return next(error);
		}
	}
}

export default new ExpedienteController();
