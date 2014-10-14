NUI - Natural UI
================
**NUI for mobile devices.**
Just a rapid proof-of-concept so far.
Testing with [Ionic framework](http://ionicframework.com/).

Includes **Angular modules** to enable declaring any DOM element to respond to drag and multi-touch, accelerometer input or calculations from a 2D PHYSICS engine to include gravity, collisions, inertia, friction etc.

##Natural UI

###Multi-touch
####Goals:  drag, throw, manipulate any DOM element with inertia.####

**Abstraction for UI design:**

Input:  one or more touches, x and y.

Output: transform a DOM element by any combo of 'translateX', 'translateY', 'translateZ', 'rotateX','rotateY','rotateZ','scale', 'scaleX','scaleY'. Can take multipliers and functions.

Ideally triggers events to chain actions.

###Physics
To make elements behave in a natural way, plain CSS animations and transitions are not enough. Therefore, a physics engine is needed.

A physics engine calculates the interactions using real properties. Many projects link this with an external renderer to draw the results on HTML5 <canvas> element. In this project, we intend to test linking the engine with plain DOM elements, to better utilize frameworks like Angular and Ionic.

####Engine
Testing the old Box2 ([Box2dWeb](https://code.google.com/p/box2dweb/wiki/BasicUsage)) currently, but might be wise to switch to [LiquidFun](http://google.github.io/liquidfun/) or something completely different (native js or even 3d).

LiquidFun enables particles, liquids and elastic bodies while maintaining compatibility with Box2D. To replace Box2dWeb with LiquidFun will not be a big task.
