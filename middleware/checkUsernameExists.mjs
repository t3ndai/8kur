import { getUserByUsername } from '../models/User.mjs'
import { DBUsernameExistsError } from '../services/storage.mjs'

const checkUsernameExists = async (req, res, next) => {
  try {
    const db = req.app.locals.db
    const username = req.body.username
    const result = await getUserByUsername(db, username)
    if (Object.keys(result).length !== 0) {
      throw new DBUsernameExistsError()
    }
    next()
  } catch (err) {
    if (err instanceof DBUsernameExistsError) {
      res.status(400).json({ error: 'username taken' }).end()
    } else {
      next(err)
    }
  }
}

export { checkUsernameExists }
