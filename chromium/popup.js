import { getTokopediaTabs, getShopeeTabs } from "./utils.js";

const colors = {
	material: '#2196F3',
	// tokopedia: '#00AA5B',
	// shopee: '#ee4d2d'
}

document.addEventListener("DOMContentLoaded", async () => {
	const container = document.getElementById("mainContainer");

	let tokopediaTabs = await getTokopediaTabs();
	let shopeeTabs = await getShopeeTabs();

	if (tokopediaTabs.length === 0 && shopeeTabs.length === 0) {
		const infoDisplay = document.createElement("div");
		infoDisplay.className = 'title';
		infoDisplay.textContent = "Can't find any tab with shipping labels"

		container.innerHTML = '';
		container.appendChild(infoDisplay);
		return;
	}


	const divTitle = document.createElement("div");
	divTitle.className = 'title';
	divTitle.textContent = `Download labels from ${tokopediaTabs.length + shopeeTabs.length} tab${(tokopediaTabs.length + shopeeTabs.length) > 1 ? 's' : ''}`;

	const errorMessage = document.createElement("div");
	errorMessage.className = 'errorMessage';
	errorMessage.textContent = 'Last download attempt was failed. Retry download to get complete results.';
	errorMessage.style.display = 'none';

	const button = document.createElement("button");
	// https://m2.material.io/components/buttons/web#contained-button
	button.className = 'mdc-button mdc-button--raised mdc-button--leading';

	button.id = 'button';
	button.style.width = '100%';
	button.style.backgroundColor = colors.material;
	button.style.marginTop = '8px';
	
	const existingContexts = await chrome.runtime.getContexts({
		contextTypes: ['OFFSCREEN_DOCUMENT'],
		documentUrls: [chrome.runtime.getURL('download.html')]
	});
	button.disabled = (existingContexts.length > 0);

	const spanIcon = document.createElement('span');
	spanIcon.className = 'mdc-button__ripple';

	const icon = document.createElement("img");
	icon.src = "/assets/download.png";
	icon.style.width = "12px";
	icon.style.height = "12px";
	icon.className = 'mdc-button__icon';

	const spanText = document.createElement('span');
	spanText.className = 'mdc-button__label';
	spanText.textContent = 'DOWNLOAD';


	container.appendChild(divTitle);
	container.appendChild(errorMessage);
	button.appendChild(spanIcon);
	button.appendChild(icon);
	button.appendChild(spanText);
	container.appendChild(button);

	mdc.ripple.MDCRipple.attachTo(button);

	button.addEventListener(
		'click',
		async () => {
			let tokopediaTabs = await getTokopediaTabs();
			let shopeeTabs = await getShopeeTabs();

			if (tokopediaTabs.length === 0 && shopeeTabs.length === 0) {
				return;
			}

			button.disabled = true;
			errorMessage.style.display = 'none';

			// send message ke background.js
			chrome.runtime.sendMessage({ downloadStart: 1 });
		}
	);
	
	chrome.runtime.onMessage.addListener((request) => {
		if (request?.downloadDone) {
			button.disabled = false;
			// console.log('download success');
		} else if (request?.downloadFailed) {
			button.disabled = false;
			errorMessage.style.display = 'block';
			// console.log('download failed');		
		}
	});
	
	let { isLastDownloadFailed } = await chrome.storage.local.get(["isLastDownloadFailed"]);
	if (isLastDownloadFailed) {
		errorMessage.style.display = 'block';
	}
	// else: tidak set apa-apa karena default value displaynya adalah none
});