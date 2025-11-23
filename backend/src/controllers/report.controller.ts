import { Request, Response, NextFunction } from "express";
import reportService from "../services/report.service";

class ReportController {
	public async summary(req: Request, res: Response, next: NextFunction) {
		try {
			const { fecha_inicio, fecha_fin, id_estado } = req.query;
			const params: any = {
				fecha_inicio: fecha_inicio ? String(fecha_inicio) : null,
				fecha_fin: fecha_fin ? String(fecha_fin) : null,
				id_estado: id_estado ? Number(id_estado) : null,
			};
			const result = await reportService.summary(params);
			const counts = result && result[0] ? result[0] : [];
			const totalCreated =
				result && result[1] && result[1][0]
					? result[1][0].total_expedientes_creados
					: 0;
			return res.json({
				countsByEstado: counts,
				total_expedientes_creados: totalCreated,
			});
		} catch (e) {
			return next(e);
		}
	}

	public async timeseries(req: Request, res: Response, next: NextFunction) {
		try {
			const { fecha_inicio, fecha_fin, id_estado } = req.query;
			const params: any = {
				fecha_inicio: fecha_inicio ? String(fecha_inicio) : null,
				fecha_fin: fecha_fin ? String(fecha_fin) : null,
				id_estado: id_estado ? Number(id_estado) : null,
			};
			const result = await reportService.timeseries(params);
			const transitions = result && result[0] ? result[0] : [];
			const registros = result && result[1] ? result[1] : [];
			return res.json({ transitions, registros });
		} catch (e) {
			return next(e);
		}
	}
}

const reportController = new ReportController();
export default reportController;
