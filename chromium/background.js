import { getCurrentTab, getTokopediaTabs, getShopeeTabs } from "./utils.js";
import { getPdfUrl } from "./shopee.js";

async function updateExtIcon() {
	let currentTab = await getCurrentTab();
	if (!currentTab) {
		return;
	}

	let tokopediaTabs = await getTokopediaTabs();
	let shopeeTabs = await getShopeeTabs();

	if (tokopediaTabs.length > 0 || shopeeTabs.length > 0) {
		chrome.action.setIcon({
			path: "assets/box_filled.png",
			tabId: currentTab.id
		});
	} else {
		chrome.action.setIcon({
			path: "assets/box_empty.png",
			tabId: currentTab.id
		});
	}
}

async function setupOffscreenDocument(path) {
	// Check all windows controlled by the service worker to see if one 
	// of them is the offscreen document with the given path
	const offscreenUrl = chrome.runtime.getURL(path);
	const existingContexts = await chrome.runtime.getContexts({
		contextTypes: ['OFFSCREEN_DOCUMENT'],
		documentUrls: [offscreenUrl]
	});

	if (existingContexts.length > 0) {
		return;
	}

	await chrome.offscreen.createDocument({
		url: path,
		reasons: ['WORKERS'],
		justification: 'download pdf',
	});
}

async function download() {
	let tokopediaTabs = await getTokopediaTabs();
	let shopeeTabs = await getShopeeTabs();

	await Promise.all([
		...tokopediaTabs.map((tab) => {
			return chrome.scripting
				.executeScript({
					target: { tabId: tab.id },
					files: [
						'packages/dom_to_image_ed.js',
						'tokopedia.js'
					],
				})
		}),
		// label shopee di-download secara sekuensial setelah semua buffer pdf berhasil diperoleh
		Promise.all(
			shopeeTabs.map(async (tab) => {
				try {
					let injectionResults = await chrome.scripting
						.executeScript({
							target: { tabId: tab.id },
							func: getPdfUrl
						});
					return injectionResults[0].result;
				} catch (err) {
					// ignore error jika pdf buffer gagal diperoleh
					return null;
				}
			})
		).then(async (pdfUrlList) => {
			// send message ke download.js
			chrome.runtime.sendMessage({ pdfUrlList });
		})
	]);
}


// gunakan ini jika tidak ingin menggunakan popup.html
// (callback onclick tombol download di popup.html langsung dijalankan ketika click icon ekstensi)
// chrome.action.onClicked.addListener(function () { });

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request?.downloadStart) {
		chrome.storage.local.set({ isLastDownloadFailed: false });
		await setupOffscreenDocument('download.html');
	} else if (request?.DOMContentLoaded) {
		await download();
	} else if (request?.downloadDone) {
		chrome.offscreen.closeDocument();
	} else if (request?.downloadFailed) {
		chrome.offscreen.closeDocument();
		chrome.storage.local.set({ isLastDownloadFailed: true });
	}
	// else if (request?.offscreenLog) {
	// 	console.log(request.offscreenLog)
	// }
});

// on extension initial load and reload
chrome.runtime.onInstalled.addListener(({ reason }) => {
	if ((reason === 'install') || (reason === 'update')) {
		updateExtIcon();
		chrome.storage.local.set({ isLastDownloadFailed: false });
	}
});

// on URL change
chrome.tabs.onUpdated.addListener(updateExtIcon);

// on tab switching
chrome.tabs.onActivated.addListener(updateExtIcon);

// on window switching
// chrome.windows.onFocusChanged.addListener(updateExtIcon);

// on window created
chrome.windows.onCreated.addListener(updateExtIcon);