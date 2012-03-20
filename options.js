/**
 * JS for the option controls. This is most likely an atrocious bastardization of MVC,
 * and/or a bad reimplementation of innumerable excellent JS frameworks.
 * */

// fill the select widget ("view") with the current filters
function populate() {
	var selector = document.getElementById("filterSelector");
	while (selector.options.length > 0) {
		selector.remove();
	}

	var allFilters = chrome.extension.getBackgroundPage().allFilters;
	for (var i in allFilters) {
		var option = document.createElement("option");
		option.text = allFilters[i];
		option.value = allFilters[i];
		selector.add(option, null);
	}
}

// save and activate changes made in the view
// TODO do this automatically on every change?
// TODO warn the user if they're leaving the page without saving
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

// add a new filter to the view (without saving or activating)
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
}

// take a filter out of the view, put it in the textbox for editing
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
}

// put the filters from default_filters.js into the view
function restoreDefaults() {
	// TODO ask for confirmation
	bgPage = chrome.extension.getBackgroundPage();
	bgPage.setFilters(bgPage.defaultFilters);
	populate();
}
