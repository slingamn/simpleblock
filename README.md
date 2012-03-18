SimpleBlock
===========

My thought process was something like this:

1. The last time I blocked ads, it made things slow. I'd like to block ads at native speed.
1. Google "chrome block ads native", get [this ticket](http://code.google.com/p/chromium/issues/detail?id=41336).
1. Follow the breadcrumbs to the [webRequest API](http://code.google.com/chrome/extensions/trunk/webRequest.html).
1. What's the smallest amount of code I can write to expose the URI-blocking functionality of webRequest?

This is the smallest ad blocking extension I could "write" for Chrome. You probably shouldn't install it. If you want to install it anyway, open `chrome://extensions/`, check the "Developer mode" box, and use "load unpacked extension" on your checked-out copy of the repository.

The icons are released by [Axialis Team](http://www.axialis.com/free/icons/) under the Creative Commons license. Any "code" of my own is released under the Apache License 2.0.

TODO
----

* Disable doesn't work (might be <http://code.google.com/p/chromium/issues/detail?id=107368>)
