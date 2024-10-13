const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.status(401).json({error: "action for logged in users only"})
  }
}

export { isAuthenticated }
