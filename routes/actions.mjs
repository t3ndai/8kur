import express from "express";
import bodyParser from "body-parser";
import { checkSchema, validationResult, body } from "express-validator";

import { isAuthenticated } from "../middleware/isAuthenticated.mjs";
import { hnScrapperQueue } from "../services/backgroundJobs.mjs";
import { importHNFavorites } from "../models/WebResources.mjs";

const actionsRouter = express.Router();

// create application/json parser
const jsonParser = bodyParser.json();

const saveHNFavorites = async (req, res, next) => {
	try {
		validationResult(req).throw();
		const userId = req.session.user;
		const { hnUsername } = req.body;
        importHNFavorites(hnUsername, userId)
		res.status(201).json({ msg: "saving your hn favorites - hold on" }).end();
	} catch (err) {
		if (err.errors) {
			res.status(400).json({ errors: err.mapped() }).end();
		} else {
			next(err);
		}
	}
};

actionsRouter.post(
	"/favorites/hn",
	jsonParser,
	checkSchema({ hnUsername: { notEmpty: true } }),
	isAuthenticated,
	saveHNFavorites,
);

export { actionsRouter };
