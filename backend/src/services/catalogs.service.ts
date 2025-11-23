import database from "../config/db";
import * as sql from "mssql";

export class CatalogsService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async listarEstados(): Promise<any[]> {
		const res = await this.db.executeSP("sp_obtener_estado_expediente", []);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets[0]) return res.recordsets[0];
		return [];
	}

	public async listarDepartamentos(): Promise<any[]> {
		const res = await this.db.executeSP("sp_obtener_departamentos", []);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets[0]) return res.recordsets[0];
		return [];
	}

	public async listarMunicipios(idDepartamento?: number): Promise<any[]> {
		const binds = idDepartamento
			? [{ name: "id_departamento", td: sql.Int, value: idDepartamento }]
			: [];
		const res = await this.db.executeSP("sp_obtener_municipios", binds);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets[0]) return res.recordsets[0];
		return [];
	}

	public async listarTiposIndicio(): Promise<any[]> {
		const res = await this.db.executeSP("sp_obtener_tipos_indicio", []);
		if (res.recordset) return res.recordset;
		if (res.recordsets && res.recordsets[0]) return res.recordsets[0];
		return [];
	}
}

const catalogsService = new CatalogsService();
export default catalogsService;
