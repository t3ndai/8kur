import express from "express";
import bodyParser from "body-parser";
import { checkSchema, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { ulid } from "ulid";
import { generateKey as genKeyCallback } from "node:crypto";
import { promisify } from "node:util";
import { add, formatISO9075 } from "date-fns";

import { User, getUserByUsername, saveUser } from "../models/User.mjs";
import { Session, saveSession } from "../models/Sessions.mjs";
import { checkUsernameExists } from "../middleware/checkUsernameExists.mjs";
import { checkEmailExists } from "../middleware/checkEmailExists.mjs";
import { DBWrongPasswordError } from "../services/storage.mjs";

// salt rounds
const saltRounds = 11;

const usersRouter = express.Router();

// create application/json parser
const jsonParser = bodyParser.json();

const generateKey = promisify(genKeyCallback);

class UserDoesNotExistError extends Error {}
class WrongPasswordError extends Error {}

const login = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { username, password: rawPassword } = req.body;
    const result = await getUserByUsername(db, username);
    const { user_id: userId, password: hashedPassword } = result?.[0] ?? {};
    if (result.length !== 0) {
      const passwordCheck = await bcrypt.compare(rawPassword, hashedPassword);
      if (!passwordCheck) {
        throw new WrongPasswordError();
      }
    } else {
      throw new UserDoesNotExistError();
    }

    const sessionKey = (await generateKey("hmac", { length: 129 }))
      .export()
      .toString("hex");
    const sessionExpiry = formatISO9075(add(Date.now(), { hours: 24 }));

    const session = Object.assign(Session, {
      session_id: sessionKey,
      expires_at: sessionExpiry,
    });
    await saveSession(db, session);

    res.status(200).json({ username, userId, token: sessionKey });
  } catch (err) {
    if (err instanceof WrongPasswordError) {
      res.status(400).json({ error: "Wrong Password" }).end();
    } else if (err instanceof UserDoesNotExistError) {
      res.status(404).json({ error: "username not found" }).end();
    } else {
      next(err);
    }
  }
};

const signup = async (req, res, next) => {
  try {
    validationResult(req).throw();

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = ulid();
    const user = Object.assign(User, {
      username,
      email,
      password: hashedPassword,
      user_id: userId,
    });
    const db = req.app.locals.db;
    await saveUser(db, user);

    const sessionKey = (await generateKey("hmac", { length: 129 }))
      .export()
      .toString("hex");
    const sessionExpiry = formatISO9075(add(Date.now(), { hours: 24 }));

    const session = Object.assign(Session, {
      session_id: sessionKey,
      expires_at: sessionExpiry,
    });
    await saveSession(db, session);

    return res.json({ username: user.username, userId, token: sessionKey });
  } catch (e) {
    if (e.type === "ValidationError") {
      return res.status(400).json({ errors: e.mapped() });
    }
    next(e);
  }
};

usersRouter
  .post(
    "/users/login",
    jsonParser,
    checkSchema({
      username: { notEmpty: true },
      password: { isLength: { options: { min: 8 } } },
    }),
    login
  )
  .post(
    "/users/signup",
    jsonParser,
    checkSchema({
      username: { isLength: { options: { min: 3 } } },
      email: { isEmail: true },
      password: { isLength: { options: { min: 8 } } },
    }),
    checkUsernameExists,
    checkEmailExists,
    signup
  );

export { usersRouter };
