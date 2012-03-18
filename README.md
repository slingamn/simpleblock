SimpleBlock
===========

SimpleBlock is an ad-blocking extension for Chrome. It has a very simple implementation and no UI.

My thought process was something like this:

1. The last time I blocked ads, it made things slow. I'd like to block ads at native speed.
1. Google "chrome block ads native", get [this ticket](http://code.google.com/p/chromium/issues/detail?id=41336).
1. Follow the breadcrumbs to the [webRequest API](http://code.google.com/chrome/extensions/trunk/webRequest.html).
1. What's the least amount of code necessary to expose the URI-blocking functionality of webRequest?

This is the smallest ad blocking extension I could "write" for Chrome. You probably shouldn't install it. If you want to install it anyway, open `chrome://extensions/`, check the "Developer mode" box, and use "load unpacked extension" on your checked-out copy of the repository.

The icons are released by [Axialis Team](http://www.axialis.com/free/icons/) under the Creative Commons license. Any "code" of my own is released under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0.html).

Details
-------
To customize, add a file `custom_filters.js` that defines a list `customFilters` of additional filters.

If you're like me and don't really understand how Chrome extensions work, here's the directed graph of this extension. `manifest.json` gives the extension an icon and a "background page", a place to keep the global extension state. `background.html` is a trivial background page importing all the code, in particular `block.js`, which calls the webRequest hooks and also listens for disabling clicks on the extension icon.

TODO
----

* Disable doesn't disable all the filters (might be <http://code.google.com/p/chromium/issues/detail?id=107368>)
