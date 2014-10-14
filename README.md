NUI - Natural UI
================
**NUI for mobile devices.** NOTE: Just a rapid proof-of-concept so far.

####DEMO: http://codepen.io/mikkokam/pen/Geotz

Testing with [Ionic framework](http://ionicframework.com/).

Includes **Angular/Ionic modules** to enable declaring any DOM element to respond to drag and multi-touch, accelerometer input or calculations from a 2D PHYSICS engine to include gravity, collisions, inertia, friction etc.

##Natural UI
From CLI to GUI, and now to NUI

CLI is based on remembering the commands.
GUI is symbolic, turns-based.
The user is presented with all the options in a symbolic form, such as a button representing a tool to scale something. The interaction is request - response; a conversation between the user and the device (indirect).
The interface is abstract, the user might be moving a mouse on a table to move a pointer elsewhere to click an icon representing a zoom tool.

So, what about NUI?

Eight Principles of Natural User Interfaces by [Rachel Hinman](http://designprinciplesftw.com/collections/eight-principles-of-natural-user-interfaces):

1. **Performance Aesthetics** - The joy of doing: the pleasure comes from the *flow of the interaction*, not the accomplishment of each task like in traditional GUI.
2. **Direct Manipulation** - Physically touching and manipulating information with fingertips or other direct means, without an aid such as a mouse. 
3. **Scaffolding** - Scaffolding is a strong cue or guide that sets users’ expectations by giving them an indication of how the interaction will unfold.
4. **Contextual Environments** - Responsive to the context, suggesting what the next interaction could be.
5. **The Super Real** - The UI elements not only feel real, but we also perceive them to be *super real* as their character can change in a way that is almost magical.
6. **Social Interaction** - Should be streamlined, enabling more opportunities for users to engage and interact with other users instead of the system’s interface.
7. **Spatial Relationships** - Represent information as objects, not symbols.
8. **Seamlessness** - Sensors, and the use of gestural UI's enable interactions to feel seamless. There are fewer barriers between the user and information.


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
