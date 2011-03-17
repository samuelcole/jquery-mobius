Author: Samuel Cole <samuelcole.name, sam@samuelcole.name>
Copyright: N/A. Public Domain. Whatevs.

A couple things to help you do 'infinite scroll' interactions.

Mobius
======

Loads the current path, automatically incrementing the 'page' param, with an ajax
GET request, and appends the contents of anything with a class .mobius to the
element .mobius was called on. Works well like this:

$('.mobius').mobius();

Sticky Bar
==========

Fixes an element to the side of the page. Does some fancy stuff too:

- Prevents the element from going above it's original position, and prevents it
  from going beneath the parent's height.
- If the element is taller then the window, allows you to scroll within the
  element, only fixing once you scroll beyond the limits of the element.
