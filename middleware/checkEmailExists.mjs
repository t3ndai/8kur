import { getUserByEmail } from '../models/User.mjs'
import { DBEmailExistsError } from '../services/storage.mjs'

const checkEmailExists = async (req, res, next) => {
  try {
    const db = req.app.locals.db
    const email = req.body.email
    const result = await getUserByEmail(db, email)
    if (Object.keys(result).length !== 0) {
      throw new DBEmailExistsError()
    }
    next()
  } catch (err) {
    if (err instanceof DBEmailExistsError) {
      res.status(400).json({ error: 'Email already in use' }).end()
    } else {
      next(err)
    }
  }
}

export { checkEmailExists }
