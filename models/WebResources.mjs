import { hnScrapperQueue } from "../services/backgroundJobs.mjs";
import { dbConnection } from "../services/storage.mjs";
import { ulid } from "ulid";

const WebResource = {
	wr_id: "",
	url: "",
	description: "",
	body: "",
	created_at: "",
	last_updated_at: "",
};
Object.preventExtensions(WebResource);

const hnBaseUrl = "https://news.ycombinator.com/";

async function importHNFavorites(hnUsername, userId) {
	const hnUrl = `${hnBaseUrl}favorites?id=${hnUsername}&comments=t`;
	const jobPayload = {
		url: hnUrl,
		userId: userId,
	};
	// add job for background processing
	hnScrapperQueue.add(`scrap-${hnUrl}`, jobPayload);
}

async function saveHNFavorites(comment, userId) {
	    let db = null;
		try {
            db = await dbConnection();
			const wrId = ulid();
			const usersWrId = ulid();
			const hnDescription = "HackerNews Comment";
			const webResource = Object.assign(WebResource, {
				wr_id: wrId,
				url: comment.url,
				description: hnDescription,
				body: JSON.stringify(comment.body),
			});
			const saveResourceStmt =
				"INSERT INTO `web_resources` (`wr_id`, `url`, `description`, `body`) VALUES(?, ?, ?, ?);";
			const webResourceValues = [
				webResource.wr_id,
				webResource.url,
				webResource.description,
				webResource.body,
			];
			const linkUserResourceStmt =
				"INSERT INTO `users_wr` (`users_wr_id`, `user_id`, `wr_id`) VALUES (?, ?, ?);";
			const linkUserValues = [usersWrId, userId, wrId];
			await db.beginTransaction();
			await db.query(saveResourceStmt, webResourceValues);
			await db.query(linkUserResourceStmt, linkUserValues);
			await db.commit();
		} catch (err) {
            console.error(err)
            if (db) {
                await db.release();
            }
			
		} finally {
            if (db) {
                db.release()
            }
        }
	
}

export { importHNFavorites, saveHNFavorites };
