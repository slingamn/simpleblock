/**
 * All the actual functionality of the extension; loads as part of the background page.
 *
 * Active ingredient is enable(), which sets up the webRequest callbacks.
 *
 * */

allFilters = null;

function setFilters(newFilters) {
	allFilters = newFilters;
	localStorage["filters"] = JSON.stringify(newFilters);
}

// magic objects that the webRequest API interprets
// we turn images and iframes into innocuous no-ops, everything else gets outright "cancelled"
blockImagePayload = {redirectUrl: "data:image/gif;,"};
blockPagePayload = {redirectUrl: "about:blank"};
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
	[["main_frame", "object", "script", "xmlhttprequest", "stylesheet", "other"], blockObject]
]

// global on/off state
blockingEnabled = false;

// register all callbacks
function enable(icon = true) {
	if (blockingEnabled) {
		return;
	}

	// edge case: enabling with urls == [] will block *all* URLs,
	// rather than none of them
	if (allFilters.length > 0) {
		for (var j in listenerCallbacks) {
			var types = listenerCallbacks[j][0];
			var callback = listenerCallbacks[j][1];
			chrome.webRequest.onBeforeRequest.addListener(
				callback,
				{urls: allFilters, types: types},
				// blocks the request until processed; needed to cancel/redir
				["blocking"]
			);
		}
	}

	blockingEnabled = true;
	if (icon) {
		chrome.browserAction.setIcon({path: "enabled.png"});
	}
}

// unregister all callbacks
function disable(icon = true) {
	for (var j in listenerCallbacks) {
		var callback = listenerCallbacks[j][1];
		chrome.webRequest.onBeforeRequest.removeListener(callback);
	}

	blockingEnabled = false;
	if (icon) {
		chrome.browserAction.setIcon({path: "disabled.png"});
	}
}

// power-cycle
function refreshFilters() {
	// work around some weird Chrome issue. seems like: on first load,
	// if you call setIcon twice in a row, the second call is ignored (?)
	disable(false);
	enable(true);
}

// switch-flip
function toggleEnabled() {
	if (blockingEnabled) {
		disable();
	} else {
		enable();
	}
}

// Initialization.

if (localStorage["filters"] == undefined) {
	console.log("Initializing filters to defaults.");
	setFilters(defaultFilters);
} else {
	allFilters = JSON.parse(localStorage["filters"]);
}

// toggle blocking on-off via the extension icon in the Omnibar
chrome.browserAction.onClicked.addListener(toggleEnabled);

// main screen turn on
enable();
