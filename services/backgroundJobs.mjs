import { Redis } from "ioredis";
import { Queue, Worker } from "bullmq";
import { hnCrawler } from "./hnCrawler.mjs";
import { saveHNFavorites } from "../models/WebResources.mjs";

const redisConnection = new Redis();

const hnScrapperQueue = new Queue("hnScrapperQueue", { redisConnection });

const hnScrapperWorker = new Worker(
	"hnScrapperQueue",
	async (job) => {
		try {
			const comments = await hnCrawler(job.data.url) ?? '';
			
            if (comments) {
                for (const comment of comments) {
                    console.log(comment);
                    const jobPayload = {
                        comment: comment,
                        userId: job.data.userId,
                    };
    
                    console.log(jobPayload)
        
                    hnSaveCommentQueue.add(`saveHn-${job.data.url}`, jobPayload, {
                        removeOnComplete: true,
                        removeOnFail: true,
                    });
                }
            }
			//job.moveToCompleted();
		} catch (err) {
			console.error(err);
			job.moveToFailed();
		}

		// are we getting the comment ?
	},
	{
		concurrency: 20,
		connection: { redisConnection, maxRetriesPerRequest: null },
		autorun: false,
	},
);

const hnSaveCommentQueue = new Queue("hnSaveQueue", { redisConnection });

const hnSaveCommentWorker = new Worker(
	"hnSaveQueue",
	async (job) => {
        try {
            await saveHNFavorites(job.data.comment, job.data.userId);
        } catch (err) {
            job.moveToFailed()
        }
	},
	{
		connection: { redisConnection, maxRetriesPerRequest: null },
		concurrency: 20,
		autorun: false,
	},
);

export {
	hnScrapperQueue,
	hnScrapperWorker,
	hnSaveCommentQueue,
	hnSaveCommentWorker,
};
