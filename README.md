# Essencery - a Not-yet-tool-conformant Essence Practice Editor

###### Live version at essencery.com (unless it's dead).

Essencery is a tool to make and edit Essence practice graphs with ease. Since Essencery is specialized for that purpose, it should hopefully be *better* (for some value of better) at editing said graphs than generic graph editing software.

Essence is a (the?) product of the [SEMAT initiative](http://semat.org/home). If you think searching for a one-development-method-to-rule-them-all is a bit silly, you might like it.

The Essencery tool is a thin wafer of Ruby on Rails (RoR) on the back-end and a biscuit of straight-up JS on the front-end. Some eight hundred lines of it!

The focus of development so far has been on how to interact effectively with a graph. Long-term, if there's interest in the tool, supporting a 'card' view of different practices rather than the simple graph node would be swell.

If you're interested in participating in this project, don't hesitate to contact us!

Cheers!


Backlog:
1. Less barebones prototype (more fullbones?)
  - Add an account system (rails probably makes this fairly trivial)
  - Add support for exporting to file/image (high-level tool conformance calls for XML, but any format would be useful at this point)
  - Improve saving functionality (current method made as a quick placeholder)
  - Wrap 'new method' and 'method index' functionality in confirmation menus
  - Prettify the landing page and related pages
  - Add support for sharing of graphs between different accounts?
2. Tool conformance
  - Essence kernel utilized and available somehow. (As bare starting graph w/ undeletable nodes? As a special node? Level of detail considerations... Represent as naturally part of graph, or as somehow separate?)
3. Graph interactivity
  - Multi-actions, eg. multi-move, multi-delete, etc.
  - Restore earlier renaming tool for consistent interface rather than use current less-quick 'shortcut' of moving tool automatically entering renaming mode?
  - Improve input functionality for naming nodes
  - Probably a hundred bug-fixes
  - Now that there's a basic method of graph interactivity, writing tests may be appropriate.
4. Long-term
  - Card support atop the graph support
