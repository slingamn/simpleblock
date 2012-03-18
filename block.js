// magic objects that the webRequest API interprets:
blockImagePayload = { redirectUrl: chrome.extension.getURL("blank.gif") };
blockPagePayload = { redirectUrl: chrome.extension.getURL("blank.html") };
cancelPayload = { cancel: true };

function blockImage(details) {
	return blockImagePayload;
}

function blockPage(details) {
	return blockPagePayload;
}

function cancelObject(details) {
	return cancelPayload;
}

listenerCallbacks = [
	[["image"], blockImage],
	[["sub_frame"], blockPage],
	[["object", "script"], cancelObject]
]

function enable() {
	for (var j in listenerCallbacks) {
		var types = listenerCallbacks[j][0];
		var callback = listenerCallbacks[j][1];
		for (var i in domainFilters) {
			chrome.webRequest.onBeforeRequest.addListener(
				callback,
				{urls: [domainFilters[i]], "types": types},
				// blocks the request until processed; needed to cancel/redir
				["blocking"]
			);
		}
	}
}

function disable() {
	// removeListener is broken, i think this fix hasn't been released yet:
	// http://code.google.com/p/chromium/issues/detail?id=107368
	for (var j in listenerCallbacks) {
		var callback = listenerCallbacks[j][1];
		chrome.webRequest.onBeforeRequest.removeListener(callback);
	}
}

blockingEnabled = true;
function toggleEnabled() {
	if (blockingEnabled) {
		disable();
		blockingEnabled = false;
		chrome.browserAction.setIcon({"path": "blocking_disabled.png"});
		console.log("Blocking disabled.");
	} else {
		enable();
		blockingEnabled = true;
		chrome.browserAction.setIcon({"path": "blocking_enabled.png"});
		console.log("Blocking enabled.");
	}
}
chrome.browserAction.onClicked.addListener(toggleEnabled);

enable();
