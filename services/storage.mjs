import mysql from 'mysql2/promise'

class DBConnectionError extends Error {}

class DBInsertError extends Error {}
class DBSelectError extends Error {}
class DBUsernameExistsError extends Error {}
class DBEmailExistsError extends Error {}
class DBWrongPasswordError extends Error {}

async function dbConnection () {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  })

  try {
    return await pool.getConnection()
  } catch (err) {
    throw new DBConnectionError(err)
  }
}

export {
  dbConnection,
  DBConnectionError,
  DBInsertError,
  DBSelectError,
  DBEmailExistsError,
  DBUsernameExistsError,
  DBWrongPasswordError
}
