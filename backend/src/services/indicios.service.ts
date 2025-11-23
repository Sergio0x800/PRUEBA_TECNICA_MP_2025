import database from "../config/db";
import * as sql from "mssql";

export class IndiciosService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async crearIndicio(data: any): Promise<any> {
		const binds = [
			{ name: "id_expediente", td: sql.Int, value: data.id_expediente },
			{ name: "numero_indicio", td: sql.Int, value: data.numero_indicio },
			{ name: "descripcion", td: sql.VarChar(500), value: data.descripcion },
			{
				name: "id_tipo_indicio",
				td: sql.Int,
				value: data.id_tipo_indicio ?? null,
			},
			{ name: "tipo", td: sql.VarChar(100), value: data.tipo ?? null },
			{ name: "color", td: sql.VarChar(50), value: data.color ?? null },
			{ name: "tamano", td: sql.VarChar(50), value: data.tamano ?? null },
			{ name: "peso", td: sql.VarChar(50), value: data.peso ?? null },
			{
				name: "ubicacion",
				td: sql.VarChar(200),
				value: data.ubicacion ?? null,
			},
			{
				name: "observacion",
				td: sql.VarChar(200),
				value: data.observacion ?? null,
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

		const res = await this.db.executeSP("sp_crear_indicio", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return res;
	}

	public async obtenerIndicio(id: number): Promise<any | null> {
		const binds = [{ name: "id", td: sql.Int, value: id }];
		const res = await this.db.executeSP("sp_obtener_indicio", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async actualizarIndicio(id: number, data: any): Promise<any> {
		const binds = [
			{ name: "id", td: sql.Int, value: id },
			{
				name: "numero_indicio",
				td: sql.Int,
				value: data.numero_indicio ?? null,
			},
			{
				name: "descripcion",
				td: sql.VarChar(500),
				value: data.descripcion ?? null,
			},
			{
				name: "id_tipo_indicio",
				td: sql.Int,
				value: data.id_tipo_indicio ?? null,
			},
			{ name: "tipo", td: sql.VarChar(100), value: data.tipo ?? null },
			{ name: "color", td: sql.VarChar(50), value: data.color ?? null },
			{ name: "tamano", td: sql.VarChar(50), value: data.tamano ?? null },
			{ name: "peso", td: sql.VarChar(50), value: data.peso ?? null },
			{
				name: "ubicacion",
				td: sql.VarChar(200),
				value: data.ubicacion ?? null,
			},
			{
				name: "observacion",
				td: sql.VarChar(200),
				value: data.observacion ?? null,
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

		const res = await this.db.executeSP("sp_actualizar_indicio", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async eliminarIndicio(
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

		const res = await this.db.executeSP("sp_eliminar_indicio", binds);
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

	public async listarPorExpediente(idExpediente: number): Promise<any[]> {
		const binds = [{ name: "id_expediente", td: sql.Int, value: idExpediente }];
		const res = await this.db.executeSP(
			"sp_obtener_indicios_por_expediente",
			binds
		);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets.length) return res.recordsets[0];
		return [];
	}
}

const indiciosService = new IndiciosService();
export default indiciosService;
