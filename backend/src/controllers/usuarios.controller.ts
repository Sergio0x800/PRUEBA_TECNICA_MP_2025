import { Request, Response, NextFunction } from "express";
import usuariosService, { UsuariosService } from "../services/usuarios.service";

export class UsuariosController {
	private service: UsuariosService;

	constructor(service: UsuariosService = usuariosService) {
		this.service = service;
	}

	public async crear(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const {
				usuario,
				clave,
				nombres,
				apellidos,
				correo,
				telefono,
				numero_empleado,
				id_usuario_registro,
			} = req.body as any;
			if (
				!usuario ||
				!clave ||
				!nombres ||
				!apellidos ||
				!correo ||
				!numero_empleado ||
				!id_usuario_registro
			) {
				res.status(400).json({
					message:
						"Faltan campos requeridos: usuario, clave, nombres, apellidos, correo, numero_empleado, id_usuario_registro",
				});
				return;
			}

			const payload = {
				usuario,
				clave,
				nombres,
				apellidos,
				correo,
				telefono: telefono ?? null,
				numero_empleado,
				id_usuario_registro: Number(id_usuario_registro),
				estado_registro: 1,
			};

			const result = await this.service.crearUsuario(payload as any);
			res.status(201).json({ message: "Usuario creado", data: result });
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
			const row = await this.service.obtenerUsuario(id);
			if (!row) {
				res.status(404).json({ message: "Usuario no encontrado" });
				return;
			}
			res.status(200).json({ data: row });
		} catch (error) {
			return next(error);
		}
	}

	public async listar(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const rows = await this.service.listarUsuarios();
			res.status(200).json({ data: rows });
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
			const updated = await this.service.actualizarUsuario(id, payload);
			res.status(200).json({ message: "Usuario actualizado", data: updated });
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
			const ok = await this.service.eliminarUsuario(id, idUsuarioActualizacion);
			if (!ok) {
				res
					.status(404)
					.json({ message: "Usuario no encontrado o no eliminado" });
				return;
			}
			res.status(200).json({ message: "Usuario eliminado (soft delete)" });
		} catch (error) {
			return next(error);
		}
	}
}

export default new UsuariosController();
