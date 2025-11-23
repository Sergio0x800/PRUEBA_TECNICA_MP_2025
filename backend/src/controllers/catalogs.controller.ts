import { Request, Response, NextFunction } from "express";
import catalogsService, { CatalogsService } from "../services/catalogs.service";

export class CatalogsController {
	private service: CatalogsService;

	constructor(service: CatalogsService = catalogsService) {
		this.service = service;
	}

	public async listarEstados(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const rows = await this.service.listarEstados();
			res.status(200).json({ data: rows });
		} catch (error) {
			console.error("Error listando estados:", error);
			return next(error);
		}
	}

	public async listarDepartamentos(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const rows = await this.service.listarDepartamentos();
			res.status(200).json({ data: rows });
		} catch (error) {
			console.error("Error listando departamentos:", error);
			return next(error);
		}
	}

	public async listarMunicipios(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const idDepartamento = req.query.id_departamento
				? Number(req.query.id_departamento)
				: undefined;
			const rows = await this.service.listarMunicipios(idDepartamento);
			res.status(200).json({ data: rows });
		} catch (error) {
			console.error("Error listando municipios:", error);
			return next(error);
		}
	}
	public async listarTiposIndicio(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const rows = await this.service.listarTiposIndicio();
			res.status(200).json({ data: rows });
		} catch (error) {
			console.error("Error listando tipos de indicio:", error);
			return next(error);
		}
	}
}

export default new CatalogsController();
