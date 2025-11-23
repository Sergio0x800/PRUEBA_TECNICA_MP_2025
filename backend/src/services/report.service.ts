import database from "../config/db";
import * as sql from "mssql";

export class ReportService {
	private db: any;

	constructor(dbInstance = database) {
		this.db = dbInstance;
	}

	public async summary(params: {
		fecha_inicio?: string | null;
		fecha_fin?: string | null;
		id_estado?: number | null;
	}): Promise<any> {
		const binds: any[] = [];
		if (params.fecha_inicio)
			binds.push({
				name: "fecha_inicio",
				td: sql.DateTime,
				value: new Date(params.fecha_inicio),
			});
		else binds.push({ name: "fecha_inicio", td: sql.DateTime, value: null });
		if (params.fecha_fin)
			binds.push({
				name: "fecha_fin",
				td: sql.DateTime,
				value: new Date(params.fecha_fin),
			});
		else binds.push({ name: "fecha_fin", td: sql.DateTime, value: null });
		if (typeof params.id_estado !== "undefined" && params.id_estado !== null)
			binds.push({ name: "id_estado", td: sql.Int, value: params.id_estado });
		else binds.push({ name: "id_estado", td: sql.Int, value: null });

		const res = await this.db.executeSP("sp_report_summary", binds);
		return res.recordsets ? res.recordsets : res;
	}

	public async timeseries(params: {
		fecha_inicio?: string | null;
		fecha_fin?: string | null;
		id_estado?: number | null;
	}): Promise<any> {
		const binds: any[] = [];
		if (params.fecha_inicio)
			binds.push({
				name: "fecha_inicio",
				td: sql.DateTime,
				value: new Date(params.fecha_inicio),
			});
		else binds.push({ name: "fecha_inicio", td: sql.DateTime, value: null });
		if (params.fecha_fin)
			binds.push({
				name: "fecha_fin",
				td: sql.DateTime,
				value: new Date(params.fecha_fin),
			});
		else binds.push({ name: "fecha_fin", td: sql.DateTime, value: null });
		if (typeof params.id_estado !== "undefined" && params.id_estado !== null)
			binds.push({ name: "id_estado", td: sql.Int, value: params.id_estado });
		else binds.push({ name: "id_estado", td: sql.Int, value: null });

		const res = await this.db.executeSP("sp_report_timeseries", binds);
		return res.recordsets ? res.recordsets : res;
	}
}

const reportService = new ReportService();
export default reportService;
