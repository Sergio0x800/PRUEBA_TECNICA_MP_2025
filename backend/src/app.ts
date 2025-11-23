import https from "https";
import fs from "fs";
import path from "path";
import app from "./server";
import database from "./config/db";
import { config } from "./config/env";

const iniciarServidor = async () => {
	try {
		database.init();

		if (config.ambiente === "prod") {
			const server = https.createServer(
				{
					key:
						config.rutaSSLKey ||
						fs.readFileSync(path.join(__dirname, "ssl", "key.pem")),
					cert:
						config.rutaSSLCert ||
						fs.readFileSync(path.join(__dirname, "ssl", "cert.pem")),
				},
				app
			);
			server.listen(config.puerto, () => {
				console.log(
					`${config.nombreServicio} corriendo en: https://${config.dominio}:${config.puerto}.`
				);
			});
		} else {
			app.listen(config.puerto, () => {
				console.log(
					`${config.nombreServicio} corriendo en: http://${config.dominio}:${config.puerto}.`
				);
			});
		}
	} catch (error) {
		console.error("Error en la inicialización:", error);
		process.exit(1);
	}
};

const apagar = async (error: Error | null = null) => {
	try {
		await database.close();
		console.log("Conexiones cerradas correctamente.");
	} catch (err: unknown) {
		console.error("Error cerrando conexiones:", err);
		error = error || (err instanceof Error ? err : new Error(String(err)));
	}
	console.log("Apagando servicio...");
	process.exit(error ? 1 : 0);
};

iniciarServidor();

process.on("SIGTERM", () => apagar());
process.on("SIGINT", () => apagar());
process.on("uncaughtException", (err) => {
	console.error("Excepción no controlada:", err);
	apagar(err);
});
