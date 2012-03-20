SimpleBlock
===========

SimpleBlock is an ad-blocking extension for Chrome (or Chromium); the main goals are simplicity of implementation and performance. It can also be thought of as the "missing frontend" to Chrome's [webRequest API](http://code.google.com/chrome/extensions/trunk/webRequest.html).

My thought process was something like this:

1. The last time I blocked ads, it made things slow. I'd like to block ads at native speed.
1. Google "chrome block ads native", get [this ticket](http://code.google.com/p/chromium/issues/detail?id=41336).
1. Follow the breadcrumbs to the webRequest API.
1. What's the least amount of code necessary to expose the URL-blocking functionality of webRequest?

The icons are released by [Axialis Team](http://www.axialis.com/free/icons/) under the Creative Commons license. My own code is released under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0.html).

Instructions
------------
Warning: the code isn't stable and is currently significantly affected by a Chrome bug (see below.)

To install, clone the repository locally, open `chrome://extensions/`, check the "Developer mode" box, and use "load unpacked extension" on the directory containing your clone. A better installation mechanism may be available once the extension is stable.

Once installed, an icon should appear next to your Omnibox. Red means blocking is enabled, blue means disabled; click the icon to toggle. Right-click and go to "options" to customize the domain filters it uses. The filter format is Chrome's [URL pattern](http://code.google.com/chrome/extensions/match_patterns.html).

Details
-------
This extension can only block external requests (images, Flash, XHR) via the aforementioned URL patterns. It won't remove ad content that is part of the actual text of the HTML page. For a more fully-featured ad blocker, try [adblockforchrome](http://code.google.com/p/adblockforchrome/).

If you're like me and don't really understand how Chrome extensions work, here's the directed graph of this extension. `manifest.json` gives the extension an icon and a "background page", a place to keep the global extension state. `background.html` is a trivial background page that loads global Javascript, in particular `block.js`. `block.js` sets up webRequest hooks that trigger on requests to the filtered URLs; this causes those URLs to be blocked across all pages. `block.js` also defines the handlers for the various UI controls. In particular, the options page can call Javascript functions on the background page, via `chrome.extension.getBackgroundPage()`.

TODO
----

* Disable doesn't disable all the filters (at least in the Chrome stable release), due to <http://code.google.com/p/chromium/issues/detail?id=107368>. This also means that clicking "apply changes" isn't sufficient to remove a filter; you'll have to restart the browser.
* The options page needs better CSS (and more UX attention in general)
