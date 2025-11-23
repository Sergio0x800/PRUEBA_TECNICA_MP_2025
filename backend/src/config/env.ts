import dotenv from "dotenv";
dotenv.config();

export const config = {
	ambiente: process.env.AMBIENTE || "dev",
	puerto: Number(process.env.PUERTO) || 3000,
	nombreServicio: process.env.NOMBRE_SERVICIO || "API",
	dominio: process.env.DOMINIO || "localhost",

	user: process.env.DB_USER || "dicriuser",
	password: process.env.DB_PASSWORD || "DicriUserPass2025!Aa",
	server: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "DB_DICRI_MP",
	poolMax: Number(process.env.DB_POOL_MAX) || 10,
	poolMin: Number(process.env.DB_POOL_MIN) || 0,
	idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,

	encrypt: process.env.DB_ENCRYPT === "true",
	enableArithAbort: true,

	rutaSSLKey: process.env.RUTA_SSL_KEY || "",
	rutaSSLCert: process.env.RUTA_SSL_CERT || "",

	jwtSecret:
		process.env.JWT_SECRET ||
		"8b9f3e2c1d0a7b6c5d4e3f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1",
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
};
