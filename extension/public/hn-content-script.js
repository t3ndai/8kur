console.log("in hn script");

const getCommentsFromPage = () => {
	const hnBaseUrl = "https://news.ycombinator.com/";
	const comments = [];
	const commentsNodes = document.querySelectorAll(".athing");

	if (!commentsNodes) {
		return "Done - Nothing to get";
	}

	for (const commentNode of commentsNodes) {
		const commentBody = commentNode.querySelector(".comment").textContent;
		const url = commentNode.querySelector(".age > a").getAttribute("href");

		comments.push({ body: commentBody, url: hnBaseUrl + url });
	}

	const nextPageBtn = document.querySelector(".morelink");
	const nextPageLink = nextPageBtn ? nextPageBtn.getAttribute("href") : "";

	// navigate only favorites page
	if (nextPageLink.toLocaleLowerCase().includes("favorites")) {
		if (nextPageLink) {
			// wait 3s to navigate to next page // or maybe randomize this
			setTimeout(() => {
				//location.assign(hnBaseUrl + nextPageLink);
				const nextPageUrl = hnBaseUrl + nextPageLink;
				chrome.runtime.sendMessage({
					name: "NextPageCommand",
					shouldNavigate: true,
					url: nextPageUrl,
				});
			}, 3000);
		}
	}

	console.log("about to get comments");
	return comments;
};

function simple() {
	console.log("did a lot of work");
}

// listen on specific custom event not domContentLoaded
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	// listen for messages sent from background.js

	if (request.name === "GetComments") {
		console.log("received message from bg worker");
		simple();
		const returnedComments = getCommentsFromPage();
		console.log(returnedComments);
		//sendResponse(true);
	}

	if (request.name === "NextPageGetComments") {
		console.log("received message after reload");
		getCommentsFromPage();
	}
});
