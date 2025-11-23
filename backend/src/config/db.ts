import * as sql from "mssql";
import { config } from "./env";

type SqlType = sql.ISqlTypeFactory | sql.ISqlType | undefined;

export interface BindParam {
	name: string;
	td?: SqlType;
	value: any;
}

class Database {
	private pool: sql.ConnectionPool | null = null;

	public async init(): Promise<void> {
		try {
			if (this.pool && this.pool.connected) return;
			const mssqlConfig: any = {
				user: config.user,
				password: config.password,
				server: config.server,
				database: config.database,
				pool: {
					max: config.poolMax ?? 10,
					min: config.poolMin ?? 0,
					idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
				},
				options: {
					encrypt: config.encrypt ?? false,
					enableArithAbort: config.enableArithAbort ?? true,
				},
			};

			this.pool = new sql.ConnectionPool(mssqlConfig);
			await this.pool.connect();
			console.log("Conexión realizada a la base de datos");
		} catch (e) {
			console.error("Error conectando a la base de datos:", e);
			throw e;
		}
	}

	public async close(): Promise<void> {
		if (this.pool) {
			try {
				await this.pool.close();
			} catch (e) {
				console.warn("Error cerrando pool de conexión:", e);
			} finally {
				this.pool = null;
			}
		}
	}

	private async getPool(): Promise<sql.ConnectionPool> {
		if (!this.pool) await this.init();
		if (!this.pool) throw new Error("Connection pool no inicializado");
		return this.pool;
	}

	public async executeSP(
		sp: string,
		binds: BindParam[] = []
	): Promise<sql.IProcedureResult<any>> {
		try {
			const p = await this.getPool();
			const request = p.request();
			for (const bind of binds) {
				if (bind.td) request.input(bind.name, bind.td as any, bind.value);
				else request.input(bind.name, bind.value);
			}
			const result = await request.execute(sp);
			return result;
		} catch (e) {
			console.error(`Error ejecutando SP ${sp}:`, e);
			throw e;
		}
	}

	public async executeQuery(queryText: string): Promise<sql.IResult<any>> {
		try {
			const p = await this.getPool();
			const request = p.request();
			const result = await request.query(queryText);
			return result;
		} catch (e) {
			console.error(`Error ejecutando query: ${queryText}`, e);
			throw e;
		}
	}
}

const database = new Database();

export default database;
export { Database };
