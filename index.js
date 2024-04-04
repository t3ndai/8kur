import express from "express";
import morgan from "morgan";
import compression from "compression";
import rid from "connect-rid";
import helmet from "helmet";
import session from "express-session";
import { hoursToMilliseconds } from "date-fns";
import "dotenv/config";

import fs from "node:fs";
import https from "node:https";

import { usersRouter } from "./routes/users.mjs";

import { dbConnection, DBConnectionError } from "./services/storage.mjs";
import { SessionAsync } from "./middleware/sessionMiddlware.mjs";

import { InternalServerError } from "./middleware/errorMiddleware.mjs";

const httpsOptions = {
	key: fs.readFileSync("8kur.net+2-key.pem"), // replace this with own generated certs for local dev
	cert: fs.readFileSync("8kur.net+2.pem"), // replace this with own generated certs for local dev
};

const cookieExpiry = hoursToMilliseconds(2);

const app = express();

// set up template rendering
app.set("views", "./views");
app.set("view engine", "pug");

// configure middleware
app.use(morgan("tiny"));
app.use(compression());
app.use(rid());
app.use(helmet());
app.use(
	session({
		secret: "trustedOnes",
		resave: false,
		cookie: { secure: true, maxAge: cookieExpiry },
		saveUninitialized: false,
	}),
);
app.use(SessionAsync);

// database initialization

const db = async () => {
	try {
		const connectionPool = await dbConnection();
		return connectionPool;
	} catch (err) {
		if (err instanceof DBConnectionError) {
			console.error(DBConnectionError);
		}
		console.error(err);
		process.exit(1);
	}
};

// insert db as middlware
const exposeDB = async (req, res, next) => {
	req.app.locals.db = await db();
	next();
};

// routing
app.get("/", viewHome);
app.use(exposeDB, usersRouter);

// error middlware
app.use(InternalServerError);

/* app.listen(4001, () => {
  console.log('listening on port 4001')
}) */

https.createServer(httpsOptions, app).listen(4001);

function viewHome(req, res) {
	return res.render("home");
}
