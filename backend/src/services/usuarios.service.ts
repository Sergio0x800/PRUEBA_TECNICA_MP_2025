import database from "../config/db";
import * as sql from "mssql";

export class UsuariosService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async crearUsuario(data: any): Promise<any> {
		const binds = [
			{ name: "usuario", td: sql.VarChar(80), value: data.usuario },
			{ name: "clave", td: sql.VarChar(200), value: data.clave },
			{ name: "nombres", td: sql.VarChar(100), value: data.nombres },
			{ name: "apellidos", td: sql.VarChar(100), value: data.apellidos },
			{ name: "correo", td: sql.VarChar(150), value: data.correo },
			{ name: "telefono", td: sql.VarChar(20), value: data.telefono ?? null },
			{
				name: "numero_empleado",
				td: sql.VarChar(20),
				value: data.numero_empleado,
			},
			{
				name: "id_usuario_registro",
				td: sql.Int,
				value: data.id_usuario_registro,
			},
			{
				name: "estado_registro",
				td: sql.TinyInt,
				value: data.estado_registro ?? 1,
			},
		];

		const res = await this.db.executeSP("sp_crear_usuario", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return res;
	}

	public async obtenerUsuario(id: number): Promise<any | null> {
		const binds = [{ name: "id", td: sql.Int, value: id }];
		const res = await this.db.executeSP("sp_obtener_usuario", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async listarUsuarios(): Promise<any[]> {
		const res = await this.db.executeSP("sp_obtener_usuarios", []);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets.length) return res.recordsets[0];
		return [];
	}

	public async actualizarUsuario(id: number, data: any): Promise<any | null> {
		const binds = [
			{ name: "id", td: sql.Int, value: id },
			{ name: "usuario", td: sql.VarChar(80), value: data.usuario ?? null },
			{ name: "clave", td: sql.VarChar(200), value: data.clave ?? null },
			{ name: "nombres", td: sql.VarChar(100), value: data.nombres ?? null },
			{
				name: "apellidos",
				td: sql.VarChar(100),
				value: data.apellidos ?? null,
			},
			{ name: "correo", td: sql.VarChar(150), value: data.correo ?? null },
			{ name: "telefono", td: sql.VarChar(20), value: data.telefono ?? null },
			{
				name: "numero_empleado",
				td: sql.VarChar(20),
				value: data.numero_empleado ?? null,
			},
			{
				name: "id_usuario_actualizacion",
				td: sql.Int,
				value: data.id_usuario_actualizacion ?? null,
			},
			{
				name: "estado_registro",
				td: sql.TinyInt,
				value: data.estado_registro ?? null,
			},
		];

		const res = await this.db.executeSP("sp_actualizar_usuario", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async eliminarUsuario(
		id: number,
		idUsuarioActualizacion?: number
	): Promise<boolean> {
		const binds = [
			{ name: "id", td: sql.Int, value: id },
			{
				name: "id_usuario_actualizacion",
				td: sql.Int,
				value: idUsuarioActualizacion ?? null,
			},
		];
		const res = await this.db.executeSP("sp_eliminar_usuario", binds);
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

const usuariosService = new UsuariosService();
export default usuariosService;
