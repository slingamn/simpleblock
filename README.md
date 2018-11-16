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
To install, clone the repository locally, open `chrome://extensions/`, check the "Developer mode" box, and use "load unpacked extension" on the directory containing your clone. A better installation mechanism may be available once the extension is more stable.

Once installed, an icon should appear next to your Omnibox. Red means blocking is enabled, blue means disabled; click the icon to toggle. Right-click and go to "options" to customize the URI filters it uses. The filter format is Chrome's [match pattern](https://developer.chrome.com/extensions/match_patterns).

Details
-------
This extension can only block external requests (images, Flash, XHR) via the aforementioned URL patterns. It won't remove ad content that is part of the actual text of the HTML page. For a more fully-featured ad blocker, try [uBlock Origin](https://github.com/gorhill/uBlock). (In fact, had uBlock Origin or HTTP Switchboard been available in 2012, SimpleBlock would probably never have been written.)

If you're like me and don't really understand how Chrome extensions work, here's the directed graph of this extension. `manifest.json` gives the extension an icon and a set of scripts. Chrome automatically attaches those scripts to a "generated background page" in which they execute; this is what contains the global extension state. (It's also possible to explicitly define a background page.) The active ingredient among these scripts is `block.js`. It sets up webRequest hooks that trigger on requests to the filtered URLs, causing those URLs to be blocked across all pages. `block.js` also defines the handlers for the various UI controls. In particular, the options page can call Javascript functions on the background page, via `chrome.extension.getBackgroundPage()`.

TODO
----

* The options page needs better CSS (and more UX attention in general)
* It should be possible to merge two sets of filters, e.g., custom filters and a new set of default filters

Ethics
------
Writing this extension led to an interesting conversation about the ethics of blocking ads. My own attitude is that blocking ads is justified by a sort of [Castle Doctrine](http://en.wikipedia.org/wiki/Castle_doctrine) for computing. If you own the hardware, it works for you and it should do what you want. Another way to look at it is that once someone has sent you bits over the network, they have no say in how you choose to process or display them.

There are some interesting cases where we attempt to voluntarily surrender this freedom. In particular, [PunkBuster](http://en.wikipedia.org/wiki/PunkBuster) prevents you from modifying your multiplayer games, and people do this in exchange for being able to play in an environment without cheating. Furthermore, the future of the PC as a gaming platform may hinge on our willingness to accept DRM technologies like [Steam](http://en.wikipedia.org/wiki/Steam_%28software%29) and [SecuROM](http://en.wikipedia.org/wiki/SecuROM).

The best counterargument against my reasoning that I've heard is that blocking ads breaks a social contract between you and the content provider. The best counter-counterargument I can muster is that in general, social contracts (beyond the most basic rules of civil society) do not hold in the marketplace. I'm interested in talking more about this.
