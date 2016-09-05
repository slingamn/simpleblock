/**
 * JS for the option controls. This is most likely an atrocious bastardization of MVC,
 * and/or a bad reimplementation of innumerable excellent JS frameworks.
 * */

// fill the select widget ("view") with the current filters
function populate() {
	var selector = document.getElementById("filterSelector");
	while (selector.options.length > 0) {
		selector.remove(0);
	}

	var allFilters = chrome.extension.getBackgroundPage().allFilters;
	for (var i in allFilters) {
		var option = document.createElement("option");
		option.text = allFilters[i];
		option.value = allFilters[i];
		selector.add(option, null);
	}

	var webRTCBox = document.getElementById("webRTCBox");
	webRTCBox.checked = chrome.extension.getBackgroundPage().webRTCPrivacy;
}

// save and activate changes made in the view
function applyChanges() {
	var allFilters = [];
	var selector = document.getElementById("filterSelector");
	for (var i = 0; i < selector.options.length; i++) {
		allFilters[i] = selector.options[i].value;
	}

	var bgPage = chrome.extension.getBackgroundPage();
	// make the changes, persist them to localStorage
	bgPage.setFilters(allFilters);
	// remove and re-add all listeners
	bgPage.refreshFilters();
}

// add a new filter to the view
function addNew() {
	var editBox = document.getElementById("newFilter");
	var newFilter = editBox.value;
	if (!newFilter) {
		return;
	}

	var selector = document.getElementById("filterSelector");
	var option = document.createElement("option");
	option.text = editBox.value;
	option.value = editBox.value;
	selector.add(option, null);
	editBox.value = null;

	applyChanges();
}

// remove a filter, put it in the textbox for editing
function removeOrEdit() {
	var selector = document.getElementById("filterSelector");
	var index = selector.selectedIndex;
	if (index == -1) {
		return;
	}

	var removedOption = selector.options[index];
	selector.remove(index);
	var editBox = document.getElementById("newFilter");
	editBox.value = removedOption.value;

	applyChanges();
}

// put the filters from default_filters.js into the view
function restoreDefaults() {
	// TODO clean this up after https://bugs.chromium.org/p/chromium/issues/detail?id=476350
	if (!chrome.extension.getBackgroundPage().confirm("This will erase your custom filters. Are you sure?")) {
		return;
	}
	var bgPage = chrome.extension.getBackgroundPage();
	bgPage.setFilters(bgPage.defaultFilters);
	bgPage.refreshFilters();
	populate();
}

function exportFilters() {
	var allFilters = chrome.extension.getBackgroundPage().allFilters;
	document.getElementById("importExportFilters").value = JSON.stringify(allFilters);
}

function importFilters() {
	var jsonFilters = document.getElementById("importExportFilters").value;
	if (!jsonFilters) {
		return;
	}

	try {
		var filters = JSON.parse(jsonFilters);
		var filtersLength = filters.length;
	} catch (e) {
		alert(e);
		return;
	}

	if (!chrome.extension.getBackgroundPage().confirm("Your filters will be replaced by these " + filtersLength + " new filters. Are you sure?")) {
		return;
	}

	var bgPage = chrome.extension.getBackgroundPage();
	bgPage.setFilters(filters);
	bgPage.refreshFilters();
	populate();
}


function sortFilters() {
	var bgPage = chrome.extension.getBackgroundPage();
	var allFilters = bgPage.allFilters;
	allFilters.sort();
	// persist back to localStorage:
	bgPage.setFilters(allFilters);
	populate();
}


function init() {
	populate();

	document.getElementById("addNewButton").addEventListener('click', addNew);
	document.getElementById("restoreDefaultsButton").addEventListener('click', restoreDefaults);
	document.getElementById("roeButton").addEventListener('click', removeOrEdit);

	document.getElementById("exportButton").addEventListener('click', exportFilters);
	document.getElementById("importButton").addEventListener('click', importFilters);

	document.getElementById("enableButton").addEventListener('click', function() {
		chrome.extension.getBackgroundPage().enable();
	})
	document.getElementById("disableButton").addEventListener('click', function() {
		chrome.extension.getBackgroundPage().disable();
	})
	document.getElementById("sortButton").addEventListener('click', sortFilters);

	var webRTCBox = document.getElementById("webRTCBox")
	webRTCBox.addEventListener('click', function() {
		chrome.extension.getBackgroundPage().setWebRTCPrivacy(webRTCBox.checked);
	});
}

document.addEventListener('DOMContentLoaded', init);
