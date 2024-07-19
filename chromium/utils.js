export function getCurrentTab() {
	return chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => tabs[0]);
}

export function getTokopediaTabs() {
	return chrome.tabs.query({}).then((tabs) => {
		return tabs.filter((t) => (
			t?.url && t.url.includes("seller.tokopedia.com/shipping-label")
		));
	});
}

export function getShopeeTabs() {
	return chrome.tabs.query({}).then((tabs) => {
		return tabs.filter((t) => (
			t?.url && t.url.includes("seller.shopee.co.id/awbprint")
		));
	});
}