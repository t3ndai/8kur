import { DBInsertError, DBSelectError } from "../services/storage.mjs";

const Session = {
  session_id: "randomkey",
  expires_at: Date.now(),
};

Object.preventExtensions(Session);

const NoSessionError = new Error("Null Session");

async function saveSession(db, session) {
  const queryStmt =
    "insert into `sessions`(`session_id`, `expires_at`) values(?,?)";
  const values = [`${session.session_id}`, `${session.expires_at}`];

  try {
    await db.execute(queryStmt, values);
    return;
  } catch (err) {
    throw new DBInsertError(err);
  }
}

async function getSession(db, sessionKey) {
  const queryStmt =
    "select `session_id` from `sessions` where `session_id` = ?";
  const values = [sessionKey];

  try {
    const [rows, _] = await db.execute(queryStmt, values);
    if (rows.length !== 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw new DBSelectError(err);
  }
}

export { Session, saveSession };
