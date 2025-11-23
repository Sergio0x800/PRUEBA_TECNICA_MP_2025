import database from "../config/db";
import * as sql from "mssql";

export class ExpedientesService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async crearExpediente(data: any): Promise<any> {
		const binds = [
			{
				name: "codigo_expediente",
				td: sql.VarChar(50),
				value: data.codigo_expediente,
			},
			{
				name: "descripcion",
				td: sql.VarChar(500),
				value: data.descripcion ?? null,
			},
			{ name: "id_departamento", td: sql.Int, value: data.id_departamento },
			{ name: "id_municipio", td: sql.Int, value: data.id_municipio },
			{
				name: "fecha_hecho",
				td: sql.DateTime,
				value: data.fecha_hecho ? new Date(data.fecha_hecho) : null,
			},
			{
				name: "id_usuario_registro",
				td: sql.Int,
				value: data.id_usuario_registro,
			},
			{
				name: "id_usuario_actualizacion",
				td: sql.Int,
				value: data.id_usuario_actualizacion ?? null,
			},
			{
				name: "estado_registro",
				td: sql.TinyInt,
				value: data.estado_registro ?? 1,
			},
		];

		const result = await this.db.executeSP("sp_crear_expediente", binds);
		return result.recordsets ? result.recordsets : result;
	}

	public async obtenerExpediente(id: number): Promise<any | null> {
		const binds = [{ name: "id", td: sql.Int, value: id }];
		const res = await this.db.executeSP("sp_obtener_expediente", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async actualizarExpediente(id: number, data: any): Promise<any> {
		const binds: any[] = [
			{ name: "id", td: sql.Int, value: id },
			{
				name: "codigo_expediente",
				td: sql.VarChar(50),
				value: data.codigo_expediente ?? null,
			},
			{
				name: "descripcion",
				td: sql.VarChar(500),
				value: data.descripcion ?? null,
			},
			{
				name: "id_departamento",
				td: sql.Int,
				value: data.id_departamento ?? null,
			},
			{ name: "id_municipio", td: sql.Int, value: data.id_municipio ?? null },
			{
				name: "fecha_hecho",
				td: sql.DateTime,
				value: data.fecha_hecho ? new Date(data.fecha_hecho) : null,
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

		const res = await this.db.executeSP("sp_actualizar_expediente", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async eliminarExpediente(
		id: number,
		idUsuarioActualizacion?: number
	): Promise<boolean> {
		const binds: any[] = [
			{ name: "id", td: sql.Int, value: id },
			{
				name: "id_usuario_actualizacion",
				td: sql.Int,
				value: idUsuarioActualizacion ?? null,
			},
		];

		const res = await this.db.executeSP("sp_eliminar_expediente", binds);
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

	public async listarPorUsuario(idUsuario: number): Promise<any[]> {
		const binds = [{ name: "id_usuario", td: sql.Int, value: idUsuario }];
		const res = await this.db.executeSP(
			"sp_obtener_expedientes_por_usuario",
			binds
		);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets.length) return res.recordsets[0];
		return [];
	}

	public async listarTodos(): Promise<any[]> {
		const res = await this.db.executeSP("sp_obtener_todos_expedientes");
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets.length) return res.recordsets[0];
		return [];
	}
}

const expedientesService = new ExpedientesService();
export default expedientesService;
