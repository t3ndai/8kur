const hnBaseUrl = "https://news.ycombinator.com/";
const comments = [];
const commentsNodes = document.querySelectorAll(".athing");
for (const commentNode of commentsNodes) {
	const commentBody = commentNode.querySelector(".comment").textContent;
	const url = commentNode.querySelector(".age > a").getAttribute("href");

	comments.push({ body: commentBody, url: hnBaseUrl + url });
}

const nextPageBtn =
	document.querySelector(".morelink").getAttribute("href") ?? "";

if (nextPageBtn) {
	// wait 3s to navigate to next page // or maybe randomize this
	setTimeout(() => {
		location.assign(hnBaseUrl + nextPageBtn);
	}, 3000);
}

console.log(comments)