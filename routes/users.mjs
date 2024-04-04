import express from 'express'
import bodyParser from 'body-parser'
import { checkSchema, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { ulid } from 'ulid'

import { User, getUserByUsername, saveUser } from '../models/User.mjs'
import { checkUsernameExists } from '../middleware/checkUsernameExists.mjs'
import { checkEmailExists } from '../middleware/checkEmailExists.mjs'
import { DBWrongPasswordError } from '../services/storage.mjs'

// salt rounds
const saltRounds = 11

const usersRouter = express.Router()

// create application/json parser
const jsonParser = bodyParser.json()

const login = async (req, res, next) => {
  try {
    const db = req.app.locals.db
    const { username, password: rawPassword } = req.body
    const result = await getUserByUsername(db, username)
    const {user_id: userId, password: hashedPassword} = result?.[0] ?? {}
    const passwordCheck = await bcrypt.compare(rawPassword, hashedPassword)
    if (!passwordCheck) {
      throw new DBWrongPasswordError()
    }
    await req.session.regenerate()
    req.session.user = userId
    await req.session.save()

    console.log(userId)
    res.status(200).json({ username })
  } catch (err) {
    if (err instanceof DBWrongPasswordError) {
      res.status(400).json({ error: 'Wrong Password' }).end()
    } else {
      next(err)
    }
  }
}

const signup = async (req, res, next) => {
  try {
    validationResult(req).throw()

    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const userId = ulid()
    const user = Object.assign(User, { username, email, password: hashedPassword, user_id: userId })
    const db = req.app.locals.db
    const returnedId = await saveUser(db, user)

    await req.session.regenerate()
    req.session.user = returnedId
    await req.session.save()

    return res.json({ username: user.username, userId })
  } catch (e) {
    if (e.type === 'ValidationError') {
      return res.status(400).json({ errors: e.mapped() })
    }
    next(e)
  }
}

usersRouter
  .post('/users/login', jsonParser, checkSchema({
    username: { notEmpty: true },
    password: { isLength: { options: { min: 8 } } }
  }), login)
  .post('/users/signup', jsonParser, checkSchema({
    username: { isLength: { options: { min: 3 } } },
    email: { isEmail: true },
    password: { isLength: { options: { min: 8 } } }
  }), checkUsernameExists, checkEmailExists, signup)

export {
  usersRouter
}
