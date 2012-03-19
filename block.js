// get the full list of filters
if (ignoreDefaultFilters) {
	allFilters = customFilters;
} else {
	allFilters = defaultFilters.concat(customFilters);
}

// magic objects that the webRequest API interprets
// we turn images and iframes into innocuous no-ops, everything else gets outright "cancelled"
blockImagePayload = {redirectUrl: chrome.extension.getURL("blank.gif")};
blockPagePayload = {redirectUrl: chrome.extension.getURL("blank.html")};
cancelPayload = {cancel: true};

// magic callbacks to deliver the abovementioned magic objects:
function blockImage(details) {
	return blockImagePayload;
}

function blockPage(details) {
	return blockPagePayload;
}

function blockObject(details) {
	return cancelPayload;
}

// types of object and callbacks to remove them:
listenerCallbacks = [
	[["image"], blockImage],
	[["sub_frame"], blockPage],
	[["object", "script", "xmlhttprequest"], blockObject]
]

// register all callbacks
function enable() {
	for (var j in listenerCallbacks) {
		var types = listenerCallbacks[j][0];
		var callback = listenerCallbacks[j][1];
		for (var i in allFilters) {
			chrome.webRequest.onBeforeRequest.addListener(
				callback,
				{urls: [allFilters[i]], types: types},
				// blocks the request until processed; needed to cancel/redir
				["blocking"]
			);
		}
	}
}

// unregister all callbacks
function disable() {
	// removeListener is broken in the stable channel:
	// http://code.google.com/p/chromium/issues/detail?id=107368
	for (var j in listenerCallbacks) {
		var callback = listenerCallbacks[j][1];
		chrome.webRequest.onBeforeRequest.removeListener(callback);
	}
}

// toggle blocking on-off via the extension icon in the Omnibar
blockingEnabled = true;
function toggleEnabled() {
	if (blockingEnabled) {
		disable();
		blockingEnabled = false;
		chrome.browserAction.setIcon({path: "disabled.png"});
	} else {
		enable();
		blockingEnabled = true;
		chrome.browserAction.setIcon({path: "enabled.png"});
	}
}
chrome.browserAction.onClicked.addListener(toggleEnabled);

// main screen turn on
enable();
