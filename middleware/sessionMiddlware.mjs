import { promisify } from 'node:util'

const SessionAsync = async (req, res, next) => {
  req.session.regenerate = promisify(req.session.regenerate)
  req.session.destroy = promisify(req.session.destroy)
  req.session.reload = promisify(req.session.reload)
  req.session.save = promisify(req.session.save)
  next()
}

export { SessionAsync }
