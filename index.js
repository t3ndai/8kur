import express from "express";
import morgan from "morgan";
import compression from "compression";
import rid from "connect-rid";
import helmet from "helmet";
import session from "express-session";
import cors from "cors";
import { hoursToMilliseconds } from "date-fns";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import "dotenv/config";

import fs from "node:fs";
import https from "node:https";

import { usersRouter } from "./routes/users.mjs";

import { dbConnection, DBConnectionError } from "./services/storage.mjs";
import { SessionAsync } from "./middleware/sessionMiddlware.mjs";

import { InternalServerError } from "./middleware/errorMiddleware.mjs";
import { actionsRouter } from "./routes/actions.mjs";
import {
  hnSaveCommentWorker,
  hnScrapperWorker,
  hnScrapperQueue,
  hnSaveCommentQueue,
} from "./services/backgroundJobs.mjs";

const httpsOptions = {
  key: fs.readFileSync("8kur.net+2-key.pem"), // replace this with own generated certs for local dev
  cert: fs.readFileSync("8kur.net+2.pem"), // replace this with own generated certs for local dev
};

const cookieExpiry = hoursToMilliseconds(2);

// set up bull dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(hnSaveCommentQueue),
    new BullAdapter(hnScrapperQueue),
  ],
  serverAdapter: serverAdapter,
});

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
  })
);
app.use(SessionAsync);
app.use("/admin/queues", serverAdapter.getRouter());
app.use(cors());

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
app.use(exposeDB, actionsRouter);

// background jobs
//hnScrapperWorker.run()
//hnSaveCommentWorker.run()

// error middlware
app.use(InternalServerError);

/* app.listen(4001, () => {
  console.log('listening on port 4001')
}) */

console.log("running server");
https.createServer(httpsOptions, app).listen(4001);

function viewHome(req, res) {
  return res.render("home");
}
