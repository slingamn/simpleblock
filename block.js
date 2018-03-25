/**
 * All the actual functionality of the extension; loads as part of the background page.
 *
 * Active ingredient is enable(), which sets up the webRequest callbacks.
 *
 * */

allFilters = null;
webRTCPrivacy = null;

function setFilters(newFilters) {
	allFilters = newFilters;
	chrome.storage.local.set({"filters": newFilters});
}

// magic objects that the webRequest API interprets
// we turn images and iframes into innocuous no-ops, everything else gets outright "cancelled"
blockImagePayload = {redirectUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI="};
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
	[["main_frame", "object", "script", "xmlhttprequest", "stylesheet", "font", "media", "ping", "csp_report", "other"], blockObject]
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

	// a scheme of "*" does not currently match ws:// or wss://
	// for current status, see:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=129353
	// https://developer.chrome.com/extensions/match_patterns
	var wsFilters = [];
	var prefix = "*://"
	allFilters.forEach(function(filter) {
		if (filter.startsWith(prefix)) {
			var suffix = filter.slice(prefix.length)
			wsFilters.push("ws://" + suffix)
			wsFilters.push("wss://" + suffix)
		}
	});
	if (wsFilters.length > 0) {
		chrome.webRequest.onBeforeRequest.addListener(
			blockObject,
			{urls: wsFilters, types: ["websocket"]},
			["blocking"]
		);
	}

	blockingEnabled = true;
	if (icon) {
		chrome.browserAction.setIcon(enabledImageData);
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
		chrome.browserAction.setIcon(disabledImageData);
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

function setWebRTCPrivacy(flag, store = true) {
	webRTCPrivacy = flag;
	var privacySetting = flag ? "default_public_interface_only" :"default";
	chrome.privacy.network.webRTCIPHandlingPolicy.set({value: privacySetting});
	if (store) {
		chrome.storage.local.set({"webrtc_privacy": flag});
	}
}

// Initialization.

chrome.storage.local.get("filters",
	function(result) {
		if (result["filters"] == undefined) {
			console.log("Initializing filters to defaults.");
			setFilters(defaultFilters);
		} else {
			setFilters(result["filters"]);
			allFilters = result["filters"];
		}

		// toggle blocking on-off via the extension icon in the Omnibar
		chrome.browserAction.onClicked.addListener(toggleEnabled);
		// main screen turn on
		enable();
	}
);

chrome.storage.local.get("webrtc_privacy",
	function(result) {
		if (result["webrtc_privacy"] == undefined) {
			console.log("Initializing WebRTC privacy to default.");
			setWebRTCPrivacy(false, true);
		} else {
			setWebRTCPrivacy(result["webrtc_privacy"], false);
		}
	}
);
