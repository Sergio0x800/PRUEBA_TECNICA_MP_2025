import database from "../config/db";
import * as sql from "mssql";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

export class AuthService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async authenticate(
		usuario: string,
		clave: string
	): Promise<any | null> {
		const binds = [
			{ name: "usuario", td: sql.VarChar(80), value: usuario },
			{ name: "clave", td: sql.VarChar(200), value: clave },
		];
		const res = await this.db.executeSP("sp_authenticate_usuario", binds);
		let user: any = null;

		if (res.recordset && res.recordset.length) user = res.recordset[0];
		else if (
			res.recordsets &&
			res.recordsets.length &&
			res.recordsets[0].length
		)
			user = res.recordsets[0][0];

		try {
			if (user && res.recordsets && res.recordsets.length > 1) {
				const rolesSet = res.recordsets[1];
				if (Array.isArray(rolesSet)) {
					user.roles = rolesSet.map((r: any) => ({
						id_rol: r.id_rol,
						nombre: r.nombre,
					}));
				}
			}
		} catch (e) {}

		return user;
	}

	public generateToken(payload: object): string {
		return jwt.sign(payload as any, JWT_SECRET as any, {
			expiresIn: JWT_EXPIRES_IN as any,
		});
	}

	public async updateUltimoAcceso(id_usuario: number): Promise<boolean> {
		const binds = [{ name: "id_usuario", td: sql.Int, value: id_usuario }];
		const res = await this.db.executeSP("sp_update_ultimo_acceso", binds);
		let affected = 0;
		if (
			res.recordset &&
			res.recordset[0] &&
			typeof res.recordset[0].affected !== "undefined"
		)
			affected = res.recordset[0].affected;
		if (
			!affected &&
			res.recordsets &&
			res.recordsets[0] &&
			typeof res.recordsets[0][0].affected !== "undefined"
		)
			affected = res.recordsets[0][0].affected;
		return affected > 0;
	}
}

const authService = new AuthService();
export default authService;
