import { getLabels, getPdfBuffer } from "./shopee.js"

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request?.pdfUrlList) {
		try {
			for (let url of request.pdfUrlList) {
				let pdfBuffer = await getPdfBuffer(url);
				await getLabels(pdfBuffer);
			}
		} catch (err) {
			// send message ke background.js dan popup.js
			chrome.runtime.sendMessage({ downloadFailed: 1 });
			return;
		}
		// send message ke background.js dan popup.js
		chrome.runtime.sendMessage({ downloadDone: 1 });
	}
});

document.addEventListener("DOMContentLoaded", () => {
	// send message ke background.js
	chrome.runtime.sendMessage({ DOMContentLoaded: 1 });
});