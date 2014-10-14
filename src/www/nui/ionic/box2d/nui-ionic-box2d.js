/**
  * NUI-Box2D (Natural UI + Box2D Physics) for Ionic - v0.0.1 - 2014
  * (c) 2014 Mikko Kamarainen <mikko.kamarainen@gmail.com>; License: MIT
  */

var Container = (window.jQuery || window.Zepto || window);
	if (!Container.Box2D) {
		throw new Error('Missing Box2D (Box2dWeb-2.1.a.3.min.js - https://code.google.com/p/box2dweb/). It must be loaded first. Aborting.');
	}

angular.module('nui.ionic.box2d', [])

.factory('nuiWorld', function($interval) {

 	var nuiWorld = {};
 	nuiWorld.destroy = function(){
 		nuiWorld.world = null;
 		$interval.cancel(loop);
 		_init();
 	}

	// Scaling Box2D units vs. pixels
	nuiWorld.SCALE = 60;

	var D2R = Math.PI / 180;
	var R2D = 180 / Math.PI;
	var PI2 = Math.PI * 2;

	var loop = null;

	var _createBox = function(x,y,width,height,static){
		var bodyDef = new Box2D.Dynamics.b2BodyDef;
		bodyDef.type = static ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = x / nuiWorld.SCALE;
		bodyDef.position.y = y / nuiWorld.SCALE

		var fixDef = new Box2D.Dynamics.b2FixtureDef;
     	fixDef.density = 10;
     	fixDef.friction = 0.6;
     	fixDef.restitution = 0.4;

		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
		fixDef.shape.SetAsBox(width / nuiWorld.SCALE, height / nuiWorld.SCALE);
		return nuiWorld.world.CreateBody(bodyDef).CreateFixture(fixDef);
	}	

	function _init(){
		// Create the Box2D World with gravity
		//nuiWorld.world = new Box2D.Dynamics.b2World(
		nuiWorld.world = new Box2D.Dynamics.b2World(
			new Box2D.Common.Math.b2Vec2(0, 9.8) // gravity
			, true // allow sleep
		);

		// Create the walls
		var w = window.innerWidth;
		var h = window.innerHeight;

		_createBox(0,h,w,5, true);
		_createBox(0,0,5,h, true);
		_createBox(w,0,5,h, true);
		_createBox(0,0,w,5, true);

		// Start calculation loop
		loop = $interval(_update,1000/60);
	}

	// The main loop
	var _update = function() {
		nuiWorld.world.Step(
			1 / 60, 	// frame-rate
			10, 		// velocity iterations
			10 			// position iterations
		);
		// CSS animation for the DOM objects
		for (var b = nuiWorld.world.m_bodyList; b; b = b.m_next) {
	         for (var f = b.m_fixtureList; f; f = f.m_next) {
					if (f.m_userData) {
						//Retrieve positions and rotations from the Box2d world
						var x = Math.floor((f.m_body.m_xf.position.x * nuiWorld.SCALE) - f.m_userData.width);
						var y = Math.floor((f.m_body.m_xf.position.y * nuiWorld.SCALE) - f.m_userData.height) - 44; // 44 px for Ionic header... TODO: fix this
						var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
						var css = {'-webkit-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', '-moz-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', '-ms-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'  , '-o-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', 'transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'};

						f.m_userData.domObj.css(css);
					}
	         }
      	}
		nuiWorld.world.ClearForces();
	}

	_init();

  	return nuiWorld;
})

.directive('nuiBody', function(nuiWorld, $window, $ionicGesture){
    return {
            restrict: 'A',
            template: '',
            scope: {
            	rot: "="
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
					console.log(elem[0]);
					console.log(elem[0].getBoundingClientRect());
					console.log(elem[0].offsetHeight);

		            var width = elem[0].offsetWidth/2;
		            var height = elem[0].offsetHeight/2;

		            var x = (attrs.nuiX) ? (_parseNumber(attrs.nuiX, $window.innerWidth)) : (elem[0].getBoundingClientRect().left + width);
		            var y = (attrs.nuiX) ? (_parseNumber(attrs.nuiY, $window.innerHeight)) : (elem[0].getBoundingClientRect().top + height);
		            
					var bodyDef = new Box2D.Dynamics.b2BodyDef;

					// Attribute nui-static = "true" will make the element static, default is dynamic (moving)
					bodyDef.type = (attrs.nuiStatic == "true") ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;

					bodyDef.position.x = x / nuiWorld.SCALE;
					bodyDef.position.y = y / nuiWorld.SCALE

					if(attrs.nuiRotate)
						bodyDef.angle= D2R * parseInt(attrs.nuiRotate);

					var fixDef = new Box2D.Dynamics.b2FixtureDef;
		         	fixDef.density = 2.0;
		         	fixDef.friction = 0.15;
		         	fixDef.restitution = 0.5;

					// Typically a circle or a box
					fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
					fixDef.shape.SetAsBox(width / nuiWorld.SCALE, height / nuiWorld.SCALE);

					var body = nuiWorld.world.CreateBody(bodyDef);
		            var fix = body.CreateFixture(fixDef);

					// Circular cross-references... Element into body & body into element for quick access:
					fix.m_userData = {domObj:elem, width:width, height:height};
					elem[0].body = body;
					
					// Reset the DOM object
					elem.css({'position': 'absolute', 'top': '0px', 'left': '0px'});
				}


			 	$ionicGesture.on('dragstart', function(ev) {
			 		// Fetch the Box2D body associated with this element:
					var body = elem[0].body;

					var md = new Box2D.Dynamics.Joints.b2MouseJointDef();
					md.bodyA = nuiWorld.world.GetGroundBody();
					md.bodyB = body;

                	mx = touchedX = ev.gesture.center.pageX;
                	my = touchedY = ev.gesture.center.pageY;

					md.target.Set(mx/nuiWorld.SCALE, my/nuiWorld.SCALE);
					md.collideConnected = true;
					md.maxForce = 100.0 * body.GetMass();

					mouseJoint = nuiWorld.world.CreateJoint(md);
					body.SetAwake(true);
        		}, elem);

        		$ionicGesture.on('drag', function(ev) {
                	mx = touchedX + ev.gesture.deltaX;
                	my = touchedY + ev.gesture.deltaY;
                  	mouseJoint.SetTarget(new Box2D.Common.Math.b2Vec2(mx/nuiWorld.SCALE, my/nuiWorld.SCALE));
        		}, elem);

        		$ionicGesture.on('dragend', function(ev) {
					nuiWorld.world.DestroyJoint(mouseJoint);
                  	mouseJoint = null;
        		}, elem);


				_init();

		    }
		}

});