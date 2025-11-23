import express, { Application } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import routes from "./routes/routes";
import errorHandler from "./middlewares/error.middleware";

import cors from "cors";

const app: Application = express();

app.use(bodyParser.json());
app.use(
	cors({
		origin: "*",
	})
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(":method :url :status :response-time ms - :user-agent"));

routes(app);

// Centralized error handler (must be after routes)
app.use(errorHandler);

export default app;
