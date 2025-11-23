import database from "../config/db";
import * as sql from "mssql";

export class ExpedienteEstadoService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async crearEstado(data: any): Promise<any> {
		const binds = [
			{ name: "id_expediente", td: sql.Int, value: data.id_expediente },
			{
				name: "id_estado_expediente",
				td: sql.Int,
				value: data.id_estado_expediente,
			},
			{
				name: "id_coordinador_revision",
				td: sql.Int,
				value: data.id_coordinador_revision,
			},
			{
				name: "motivo_rechazo",
				td: sql.VarChar(500),
				value: data.motivo_rechazo ?? null,
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

		const res = await this.db.executeSP("sp_crear_expediente_estado", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return res;
	}

	public async obtenerEstado(id: number): Promise<any | null> {
		const binds = [{ name: "id", td: sql.Int, value: id }];
		const res = await this.db.executeSP("sp_obtener_expediente_estado", binds);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async actualizarEstado(id: number, data: any): Promise<any> {
		const binds = [
			{ name: "id", td: sql.Int, value: id },
			{ name: "id_expediente", td: sql.Int, value: data.id_expediente ?? null },
			{
				name: "id_estado_expediente",
				td: sql.Int,
				value: data.id_estado_expediente ?? null,
			},
			{
				name: "id_coordinador_revision",
				td: sql.Int,
				value: data.id_coordinador_revision ?? null,
			},
			{
				name: "motivo_rechazo",
				td: sql.VarChar(500),
				value: data.motivo_rechazo ?? null,
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

		const res = await this.db.executeSP(
			"sp_actualizar_expediente_estado",
			binds
		);
		if (res.recordset && res.recordset.length) return res.recordset[0];
		if (res.recordsets && res.recordsets.length && res.recordsets[0].length)
			return res.recordsets[0][0];
		return null;
	}

	public async eliminarEstado(
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

		const res = await this.db.executeSP("sp_eliminar_expediente_estado", binds);
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

	public async listarPorExpediente(id_expediente: number): Promise<any[]> {
		const binds = [
			{ name: "id_expediente", td: sql.Int, value: id_expediente },
		];
		const res = await this.db.executeSP(
			"sp_obtener_expediente_estados_por_expediente",
			binds
		);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets.length) return res.recordsets[0];
		return [];
	}
}

const expedienteEstadoService = new ExpedienteEstadoService();
export default expedienteEstadoService;
