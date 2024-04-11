import "./App.css";

function App() {
	const HNfavActionBtn = async () => {
		// eslint-disable-next-line no-undef
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
    
		if (tab) {
			try {
        console.log('about to execute script')
				/* await chrome.scripting.executeScript({
					target: { tabId: tab.id },
					files: ['hn-content-script.js']
				})  */    

        const response = await chrome.runtime.sendMessage({name: 'GetCommentsCommand', tabId: tab.id}, () => {
          console.log('done sent to background')
        })
        console.log(response)
			} catch (err) {
				console.error(err);
			}
		}
	};

	return (
		<>
			<div className="card">
				<button onClick={HNfavActionBtn}>Import from HN</button>
			</div>
		</>
	);
}

export default App;
