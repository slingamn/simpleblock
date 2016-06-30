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
function enable() {
	if (blockingEnabled) {
		return;
	}

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

	blockingEnabled = true;
	chrome.browserAction.setIcon({path: "enabled.png"});
}

// unregister all callbacks
function disable() {
	for (var j in listenerCallbacks) {
		var callback = listenerCallbacks[j][1];
		chrome.webRequest.onBeforeRequest.removeListener(callback);
	}

	blockingEnabled = false;
	chrome.browserAction.setIcon({path: "disabled.png"});
}

// power-cycle
function refreshFilters() {
	disable();
	enable();
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
