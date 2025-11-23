import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";

export class AuthController {
	public async login(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { usuario, clave } = req.body as any;
			if (!usuario || !clave) {
				res.status(400).json({ message: "usuario y clave son requeridos" });
				return;
			}

			const user = await authService.authenticate(usuario, clave);
			if (!user) {
				res.status(401).json({ message: "Credenciales inválidas" });
				return;
			}

			const payload = {
				id_usuario: user.id_usuario,
				usuario: user.usuario,
				roles: Array.isArray(user.roles)
					? user.roles.map((r: any) => r.nombre)
					: [],
			};
			const token = authService.generateToken(payload);

			try {
				await authService.updateUltimoAcceso(user.id_usuario);
			} catch (err) {
				console.warn("No se pudo actualizar ultimo_acceso:", err);
			}

			res.status(200).json({ message: "Autenticado", token, user });
		} catch (error) {
			return next(error);
		}
	}
}

export default new AuthController();
