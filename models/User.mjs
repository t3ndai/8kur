import {
	DBEmailExistsError,
	DBInsertError,
	DBSelectError,
	DBUsernameExistsError,
} from "../services/storage.mjs";

const User = {
	email: "",
	username: "",
	password: "",
	user_id: "",
	created_at: "",
};
Object.preventExtensions(User);

async function saveUser(db, user) {
	console.log(user);
	const queryStmt =
		"INSERT INTO `users` (`username`, `email`, `password`, `user_id`) VALUES (?,?,?,?)";
	const values = [
		`${user.username}`,
		`${user.email}`,
		`${user.password}`,
		`${user.user_id}`,
	];
	try {
		const [result] = await db.execute(queryStmt, values);
		return result.insertId;
	} catch (err) {
		throw new DBInsertError(err);
	}
}

async function getUserByUsername(db, username) {
	try {
		const queryStmt =
			"select `user_id`, `password` from `users` where `username` = ?";
		const values = [username];

		const [rows] = await db.execute(queryStmt, values);
		return rows;
	} catch (err) {
		console.error(err);
		throw new DBSelectError(err);
	}
}

async function getUserByEmail(db, email) {
	try {
		const queryStmt = "select `user_id` from `users` where `email` = ?";
		const values = [email];

		const [rows] = await db.execute(queryStmt, values);

		return rows;
	} catch (err) {
		console.log(err);
		throw new DBSelectError(err);
	}
}

export { User, saveUser, getUserByUsername, getUserByEmail };
