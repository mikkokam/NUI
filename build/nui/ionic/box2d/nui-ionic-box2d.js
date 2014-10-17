/**
  * NUI-Box2D (Natural UI + Box2D Physics) for Ionic - v0.0.2 - 2014
  * (c) 2014 Mikko Kamarainen <mikko.kamarainen@gmail.com>; License: MIT
  */

var Container = (window.jQuery || window.Zepto || window);
	if (!Container.b2World) {
		throw new Error('Missing LiquidFun (liquidfun.js - http://google.github.io/liquidfun/). It must be loaded first. Aborting.');
	}

angular.module('nui.ionic.box2d', [])

.factory('nuiWorld', function($interval) {

 	var nuiWorld = {world: null};

 	nuiWorld.reset = function(){
		if (nuiWorld.world !== null) {
			while (nuiWorld.world.joints.length > 0) {
		  		nuiWorld.world.DestroyJoint(nuiWorld.world.joints[0]);
			}

			while (nuiWorld.world.bodies.length > 0) {
		  		nuiWorld.world.DestroyBody(nuiWorld.world.bodies[0]);
			}

			while (nuiWorld.world.particleSystems.length > 0) {
		  		nuiWorld.world.DestroyParticleSystem(nuiWorld.world.particleSystems[0]);
			}
		}
		_createBounds();
 		// $interval.cancel(loop);
 	}

	// Scaling Box2D units vs. pixels
	nuiWorld.SCALE = 60;

	var D2R = Math.PI / 180;
	var R2D = 180 / Math.PI;
	var PI2 = Math.PI * 2;

	var loop = null;

	var _createBox = function(x,y,width,height,static){
		var bodyDef = new b2BodyDef;
		bodyDef.type = static ? b2_staticBody : b2_dynamicBody;
		bodyDef.position.x = x / nuiWorld.SCALE;
		bodyDef.position.y = y / nuiWorld.SCALE

		var fixDefWall = new b2FixtureDef;
     	fixDefWall.density = 10;
     	fixDefWall.friction = 0.6;
     	fixDefWall.restitution = 0.4;

		fixDefWall.shape = new b2PolygonShape;

		fixDefWall.shape.SetAsBoxXY(width / nuiWorld.SCALE, height / nuiWorld.SCALE);
		return world.CreateBody(bodyDef).CreateFixtureFromDef(fixDefWall);
	}

	function _createBounds(){
		// Create the basic ground body to use later (i.e. mouse drag)
  		nuiWorld.g_groundBody = world.CreateBody(new b2BodyDef);
		// Create the walls
		var w = window.innerWidth;
		var h = window.innerHeight;

		_createBox(0,h,w,5, true);
		_createBox(0,0,5,h, true);
		_createBox(w,0,5,h, true);
		_createBox(0,0,w,5, true);

	}


	function _init(){
		// Create the Box2D World with gravity
		var gravity = new b2Vec2(0, 10);
  		world = new b2World(gravity);
  		nuiWorld.world = world;

  		_createBounds();

		// Start calculation loop
		var ival = 1000/60;
		loop = $interval(_render, ival);
	}

	// The main loop
	var _STEP = 1.0/60.0;
	var _render = function() {
		nuiWorld.world.Step(_STEP,8,8);
		var f=null;
		// CSS transform for the DOM objects
		for (var i=0, li=nuiWorld.world.bodies.length; i < li; i++) {     	
         	f = nuiWorld.world.bodies[i].GetPosition();
         	a = nuiWorld.world.bodies[i].GetAngle();
			if(nuiWorld.world.bodies[i].fixtures[0]) if(nuiWorld.world.bodies[i].fixtures[0].userData) {
				
				//Retrieve positions and rotations from the Box2d world
				var x = Math.floor((f.x * nuiWorld.SCALE) - nuiWorld.world.bodies[i].fixtures[0].userData.width);
				var y = Math.floor((f.y * nuiWorld.SCALE) - nuiWorld.world.bodies[i].fixtures[0].userData.height) - 44; // 44 px for Ionic header... TODO: fix this
				var css = {'-webkit-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + a  + 'rad)', '-moz-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + a  + 'rad)', '-ms-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + a  + 'rad)'  , '-o-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + a  + 'rad)', 'transform':'translate(' + x + 'px,' + y + 'px) rotate(' + a  + 'rad)'};

				nuiWorld.world.bodies[i].fixtures[0].userData.domObj.css(css);
			}

      	}
	}
	_init();
  	return nuiWorld;
})

/** 
* Attributes (all optional)
* nui-shape: "box", "circle"
* nui-x and nui-y: position (midpoint), either px or %
* nui-width and nui-height: size, either px or %
*/
.directive('nuiBody', function(nuiWorld, $window, $ionicGesture){
    return {
            restrict: 'A',
            template: '',
            scope: {
            },
            link: function (scope, elem, attrs) {
				var mouseJoint = null;
				var touchedX = 0, touchedY = 0, mx = 0, my = 0;
				var D2R = Math.PI / 180;
				var R2D = 180 / Math.PI;
				var PI2 = Math.PI * 2;				

				// Helper to parse % or pixels - just feed the input and the potential full measurement, will return px always.
				_parseNumber = function(str, full){
					return ((str.indexOf("%") != -1) ? (parseInt(str)/100 * full) : (parseInt(str)) );
				}


				function _init(){
					// The Box2D World
					var world = nuiWorld.world;

					// Create Object from DOM into Box2D:
					// console.log(elem[0]);
					// console.log(elem[0].getBoundingClientRect());
					// console.log(elem[0].offsetHeight);

		            var width = (attrs.nuiWidth) ? (_parseNumber(attrs.nuiWidth, $window.innerWidth)/2) : (elem[0].offsetWidth/2);
		            var height = (attrs.nuiHeight) ? (_parseNumber(attrs.nuiHeight, $window.innerHeight)/2) : (elem[0].offsetHeight/2);
					if(height == 0 || width == 0)
						throw new Error("Element dimensions are not set early enough. Do it by a class or style (ng-style and ng-class may be not set yet) -- or nui-width and nui-height attributes. " + elem[0]);

		            var x = (attrs.nuiX) ? (_parseNumber(attrs.nuiX, $window.innerWidth)) : (elem[0].getBoundingClientRect().left + width);
		            var y = (attrs.nuiX) ? (_parseNumber(attrs.nuiY, $window.innerHeight)) : (elem[0].getBoundingClientRect().top + height);
		            
					var bodyDef = new b2BodyDef;

					// Attribute nui-static = "true" will make the element static, default is dynamic (moving)
					bodyDef.type = (attrs.nuiStatic == "true") ? b2_staticBody : b2_dynamicBody;

					bodyDef.position.Set(x / nuiWorld.SCALE, y / nuiWorld.SCALE);

					if(attrs.nuiRotate)
						bodyDef.angle= D2R * parseInt(attrs.nuiRotate);

					var fixDef = new b2FixtureDef;
		         	fixDef.density = 2.0;
		         	fixDef.friction = 0.15;
		         	fixDef.restitution = 0.5;

					// Typically a circle or a box
					if(attrs.nuiShape == "circle"){
						fixDef.shape = new b2CircleShape;
						fixDef.shape.radius = (width / nuiWorld.SCALE)
					}else{
						fixDef.shape = new b2PolygonShape;
						fixDef.shape.SetAsBoxXY(width / nuiWorld.SCALE, height / nuiWorld.SCALE);
					}

					var body = nuiWorld.world.CreateBody(bodyDef);
		            var fix = body.CreateFixtureFromDef(fixDef);

					// Circular cross-references... Element into body & body into element for quick access:
					fix.userData = {domObj:elem, width:width, height:height};
					elem[0].body = body;
					
					// Reset the DOM object
					elem.css({'position': 'absolute', 'top': '0px', 'left': '0px'});
				}				


			 	$ionicGesture.on('dragstart', function(ev) {
			 		// Fetch the Box2D body associated with this element:
					var body = elem[0].body;

					var md = new b2MouseJointDef();
					md.bodyA = nuiWorld.g_groundBody;
					md.bodyB = body;

                	mx = touchedX = ev.gesture.center.pageX;
                	my = touchedY = ev.gesture.center.pageY;

					md.target.Set(mx/nuiWorld.SCALE, my/nuiWorld.SCALE);
					md.collideConnected = true;
					md.maxForce = 100.0 * body.GetMass();

					mouseJoint = world.CreateJoint(md);
					body.SetAwake(true);
        		}, elem);

        		$ionicGesture.on('drag', function(ev) {
                	mx = touchedX + ev.gesture.deltaX;
                	my = touchedY + ev.gesture.deltaY;
                  	mouseJoint.SetTarget(new b2Vec2(mx/nuiWorld.SCALE, my/nuiWorld.SCALE));
        		}, elem);

        		$ionicGesture.on('dragend', function(ev) {
					world.DestroyJoint(mouseJoint);
                  	mouseJoint = null;
        		}, elem);


				_init();

		    }
		}

});