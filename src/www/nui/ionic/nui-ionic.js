/**
  * NUI (Natural UI) for Ionic - v0.0.2 - 2014
  * (c) 2014 Mikko Kamarainen <mikko.kamarainen@gmail.com>; License: MIT
  */

var Container = (window.jQuery || window.Zepto || window);
	if (!Container.Velocity || !Container.Velocity.Utilities || !Container.Velocity.RegisterUI) {
		throw new Error('Missing velocity.js and/or velocity.ui.js (http://julian.com/research/velocity/). Velocity must be loaded first. Aborting.');
	}

// Each instance will copy these and override any parameter by optional attributes from the element:
var _nuiDefaults = {
    // saving internally as: [x,y, rotateZ, scale]
	"touched": [0.0, 0.0, 0.0, 1.0],
    "dragX": [ ['translateX', 1.0] ],
    "dragY": [ ['translateY', 1.0] ],
    "dragFunctionX": [function(val){return val}],
    "dragFunctionY": [function(val){return val}],

    "supportedDrag": [
        'translateX', 'translateY', 'translateZ', 
            'rotateX',
            'rotateY',
            'rotateZ',
        'scale', 'scaleX', 'scaleY', 'scaleZ'],
    "prototypeFunctions": [
        function(val, m){return m * val}, function(val, m){return m * val}, function(val, m){return m * val},
            function(val, m){
                return (m * 90 * (val / Container.innerHeight))},
            function(val, m){
                return (m * 90 * (val / Container.innerWidth))}, 
            function(val, m){
                return (m * 90 * (val / Container.innerWidth))},
        function(val, m){return m * val}, function(val, m){return m * val}, function(val, m){return m * val}, function(val, m){return m * val}
    ],
    
    "limitX": null,
    "limitY": null,
    
    "stopsX": null,
    "stopsY": null,

    "friction": 0.5,
    "easeTime": "300", 
    "easeType": "ease-out",
    
    "windowWidth": Container.innerWidth,
    "windowHeight": Container.innerHeight
};

angular.module('nui.ionic', [])

// TODO: add configs for Tiltable
.directive('nuiTiltable', function($window){
    return {
            restrict: 'A',
            template: '',
            scope: {
            },
            link: function (scope, elem, attrs) {

            	// Remote target: It is possible to tilt a specific element, attaching the listeners elsewhere.
            	// If no remote targetId is given, assuming the same element is the listener and the target:

                el = (attrs.targetId != null) ? angular.element(document.getElementById(attrs.targetId)) : elem;
                if(el == null) throw  new Error("<nui-tiltable> Check the parameters: target-id is given but an element with that id could not be found.");
               

                // disable Velocity easings for immediate animations:
                Velocity.mock = true;

                el.nuiTilt = _parseConfig(attrs, angular.copy(_nuiDefaults));

                _initialFB = null;
             
                // Orientation
                // Listen for the deviceorientation event and handle the raw data
                if ($window.DeviceOrientationEvent)
                    $window.addEventListener('deviceorientation', tilt = function(eventData){
	                    // gamma is the left-to-right tilt in degrees, right is positive
	                    _tiltLR = eventData.gamma;
	                    if(el.nuiTiltlimitY != null)
	                        _tiltLR = _enforceMinMax(_tiltLR, el.nuiTiltlimitY[0], el.nuiTiltlimitY[1]);

	                    // beta is the front-to-back tilt in degrees, front is positive
	                    if(_initialFB == null) _initialFB = eventData.beta;
	                    _tiltFB = eventData.beta - _initialFB;
	                    if(el.nuiTiltlimitX != null)
	                        _tiltFB = _enforceMinMax(_tiltFB, el.nuiTiltlimitX[0], el.nuiTiltlimitX[1]);

	                    // alpha is the compass direction the device is facing in degrees
	                    _dir = eventData.alpha

	                    Velocity(el, {rotateY: -_tiltLR, rotateX: _tiltFB}, 0);                    	

                    }
                	, false);
            }
        }
})



.directive('nuiTouchable', function($ionicGesture, $window, $document){
	// Kill iOS bouncing of Safari while dragging:
	$document.bind(
   		'touchmove',
   		function(e) {
 			e.preventDefault();
   		}
	);	
    return {
        restrict: 'A',
        template: '',
        scope: {
        },
        link: function (scope, elem, attrs) {
        	var el = null;
        	// values while touching - saved to el.nui.touched[]
        	var x = 0;
        	var y = 0;
        	var rotate = 0;
        	var scale = 1.0;
        	var multiTouchStage = 0;

            // Remote target: It is possible to drag another element, attaching the listeners elsewhere.
            // This lets the user drag an element and have an effect elsewhere (like a container including the element).
            // If no remote targetId is given, assuming the same element is the listener and the target:
            el = (attrs.targetId != null) ? angular.element(document.getElementById(attrs.targetId)) : elem;
            if(el == null) throw new Error("<nui-touchable> Check the parameters: target-id is given but an element with that id could not be found.");
            
            // NOTE: the target element 'position' should be 'absolute' or 'relative'.


        	// Defaults + attributes
        	el.nui = _parseConfig(attrs, angular.copy(_nuiDefaults));

			// A WORK-AROUND needed: Hammer.js with multi-touch:
			// Spitting: transform start, transforms, drag start, drag(s), transform end, drag end.
			// Need to clean out the drag from a transform (thus multiTouchStage).
			// Also, the first deltaX and deltaY of a multitouch will trigger a jump, which is cleaned away later.

            $ionicGesture.on('dragstart', function(ev) {
            	if(multiTouchStage == 2) multiTouchStage = 3;
            }, elem);

            $ionicGesture.on('transformstart', function(ev) {
            	multiTouchStage = 1;
            }, elem);
            
            $ionicGesture.on('transformend', function(ev) {
            	multiTouchStage = 5;
            	el.nui.touched[2] = rotate;
            	el.nui.touched[3] = scale;     

         	}, elem);


            $ionicGesture.on('drag transform', function(ev) {
            	if(multiTouchStage == 1){
            		// Fixing the multi-touch start jump:
            		el.nui.touched[0] -= ev.gesture.deltaX;
            		el.nui.touched[1] -= ev.gesture.deltaY;
            		multiTouchStage = 2;
            	}
            	// Disable Velocity easings for immediate animations:
            	Velocity.mock = true;

            	// After a multi-touch, Hammer will send a single drag event and cause problems. Skipping those.
            	if(multiTouchStage > 2)
            		return;

                // Record momentary velocity / last one is used for decelerate. Hammer.js velocity is average, so of no use for us.
                el.nui.endVelocityX = -x + (el.nui.touched[0] + ev.gesture.deltaX);
                el.nui.endVelocityY = -y + (el.nui.touched[1] + ev.gesture.deltaY);

                // ev: during drag, hammer.js spits these events about every 16 ms = 60 fps
                x = el.nui.touched[0] + ev.gesture.deltaX;
                y = el.nui.touched[1] + ev.gesture.deltaY;

                rotate = el.nui.touched[2] + ev.gesture.rotation;
                scale = el.nui.touched[3] * ev.gesture.scale;

                // BOUNDARIES:
                if(el.nui.limitX != null)
                	x = _enforceMinMax(x, el.nui.limitX[0], el.nui.limitX[1]);
                if(el.nui.limitY != null)
                	y = _enforceMinMax(y, el.nui.limitY[0], el.nui.limitY[1]);

                // All the transforms, construct an object:
                var transforms = {};
                for(var i=0, len=el.nui.dragX.length; i < len; i++)
                    transforms[el.nui.dragX[i][0]] = el.nui.dragFunctionX[i](x, el.nui.dragX[i][1]);
                for(var i=0, len=el.nui.dragY.length; i < len; i++)
                    transforms[el.nui.dragY[i][0]] = el.nui.dragFunctionY[i](y, el.nui.dragY[i][1]);

                transforms.rotateZ = rotate;
                transforms.scale = scale;

                Velocity(el, transforms, 0);

            }, elem);


         	$ionicGesture.on('dragend', function(ev) {
         		if(multiTouchStage == 5)
         			multiTouchStage = 0;

                // Enable ease-out effects:
                Velocity.mock = false;

                // DECELERATE:
    			x += el.nui.endVelocityX * 1 / el.nui.friction;
    			y += el.nui.endVelocityY * 1 / el.nui.friction;

                // BOUNDARIES:
                if(el.nui.limitX != null)
                	x = _enforceMinMax(x, el.nui.limitX[0], el.nui.limitX[1]);
                if(el.nui.limitY != null)
                	y = _enforceMinMax(y, el.nui.limitY[0], el.nui.limitY[1]);

                //STOPS:
			    if(el.nui.stopsX != null){
			    	x = _enforceMinMax(x, el.nui.stopsX[0], el.nui.stopsX[el.nui.stopsX.length-1]);
			        for(var i=1, len=el.nui.stopsX.length; i < len; i++)
			            if((el.nui.stopsX[i-1] < x) && ((el.nui.stopsX[i] > x)))
			                x = (x > ((el.nui.stopsX[i] + el.nui.stopsX[i-1])/2)) ? el.nui.stopsX[i] : el.nui.stopsX[i-1];
			    }
			    if(el.nui.stopsY != null){
			    	y = _enforceMinMax(y, el.nui.stopsY[0], el.nui.stopsY[el.nui.stopsY.length-1]);
			        for(var i=1, len=el.nui.stopsY.length; i < len; i++)
			            if((el.nui.stopsY[i-1] < y) && ((el.nui.stopsY[i] > y)))
			                y = (y > ((el.nui.stopsY[i] + el.nui.stopsY[i-1])/2)) ? el.nui.stopsY[i] : el.nui.stopsY[i-1];        
			    }

                // SAVE drag
                el.nui.touched[0] = x;
                el.nui.touched[1] = y;
               
                var transforms = {};
                for(var i=0, len=el.nui.dragX.length; i < len; i++)
                    transforms[el.nui.dragX[i][0]] = el.nui.dragFunctionX[i](x, el.nui.dragX[i][1]);
                for(var i=0, len=el.nui.dragY.length; i < len; i++)
                    transforms[el.nui.dragY[i][0]] = el.nui.dragFunctionY[i](y, el.nui.dragY[i][1]);
                transforms.rotateZ = rotate;
                transforms.scale = scale;                

                Velocity(el, transforms, el.nui.easeTime, el.nui.easeType);

            }, elem);


  		}
	}

})

// TODO: add configs for this
.directive('nuiGravity', function($window, $interval){
    return {
            restrict: 'A',
            template: '',
            scope: {
            },
            link: function (scope, elem, attrs) {
            	var falling = null;
            	var y = 0, t = 0.0;
            	// frames per second
            	var fps = 50;
            	// pixels per meter
            	var dpm = 96 * 39;
            	// gravity
            	var g = 9.8;

            	// multiplier for time
            	var slowDown = 10;
            	fps *= slowDown;
            	
                // disable Velocity easings for immediate animations:
                Velocity.mock = true;

                elem.on('$destroy', function() {
        			$interval.cancel(falling);
      			});

      			// console.log(elem[0].getBoundingClientRect());

                // el.nuiGravity = _parseConfig(attrs, angular.copy(_nuiDefaults));

                var fall = function(initialVelocity){
                	$interval.cancel(falling);
	                falling = $interval(function() {
	                	t += 1/fps;
	                	velocity = initialVelocity * dpm + dpm * g * t;
	                	y += velocity * 1/fps;
	                	Velocity(elem, {translateY: y}, 0);
	                	if(elem[0].getBoundingClientRect().bottom > $window.innerHeight){
	                		 bounce(velocity/dpm);
	            		}
	                }, 1000/fps * slowDown);
                }

                var bounce = function(initialVelocity){
                	t = 0;
  					y-= elem[0].getBoundingClientRect().bottom - $window.innerHeight;
                	if(Math.abs(initialVelocity) > 0.1)
                		fall(-initialVelocity * 0.8)
                	else
                		stopFalling();
                }

                var stopFalling = function(velo){
                	$interval.cancel(falling);
                }


                fall(-0.5);


            }
        }
})




_enforceMinMax = function(val, min, max){
	return(Math.min(Math.max(val, min), max));	
}

_parseNumber = function(str, full){
	// Parse % or pixels:
	return ((str.indexOf("%") != -1) ? (parseInt(str)/100 * full) : (parseInt(str)) );
}

_parseConfig = function(config, target){
    // Parse the config object, do some basic error checking

    if(config.nuiLimitX != null){
        target.limitX = config.nuiLimitX.split(",").map(function(x) { return _parseNumber(x, target.windowWidth) });
        if(isNaN(target.limitX[0]) || isNaN(target.limitX[1]) || target.limitX.length!=2) throw  new Error("<nui-draggable> Check the parameters: - incorrect limit-x: '"+config.nuiLimitX+"', expecting min, max (px or % of the window WIDTH).");
    }

    if(config.nuiLimitY != null){
        target.limitY = config.nuiLimitY.split(",").map(function(y) { return _parseNumber(y, target.windowHeight) });
        if(isNaN(target.limitY[0]) || isNaN(target.limitY[1]) || target.limitY.length!=2) throw  new Error("<nui-draggable> Check the parameters: - incorrect limit-y: '"+config.nuiLimitY+"', expecting min, max (px or % the window HEIGHT).");
    }

    if(config.nuiStopsX != null)
        target.stopsX = config.nuiStopsX.split(",").map(function(x) { return _parseNumber(x, target.windowWidth) });

    if(config.nuiStopsY != null)
        target.stopsY = config.nuiStopsY.split(",").map(function(y) { return _parseNumber(y, target.windowHeight) });

    if(config.nuiDragX != null){
        for(var i=0, transforms = config.nuiDragX.split(","); i < transforms.length; i++){
            target.dragX[i] = [];
            target.dragX[i][0] = transforms[i].split(":")[0].trim();
            target.dragFunctionX[i] = target.prototypeFunctions[target.supportedDrag.indexOf(target.dragX[i][0])];
            // use multiplier, if present (negative reverses):
            if(transforms[i].split(":").length > 1)
                target.dragX[i][1] = parseFloat(transforms[i].split(":")[1]);
            if(target.supportedDrag.indexOf(target.dragX[i][0]) == -1) throw  new Error("<nui-draggable> Check the parameters: unimplemented drag-x: expecting (transform: multiplier, transform2: multiplier2...) - Transform can be one of: ["+target.supportedDrag+"]");

        }
    }
    if(config.nuiDragY != null){
        for(var i=0, transforms = config.nuiDragY.split(","); i < transforms.length; i++){
            target.dragY[i] = [];
            target.dragY[i][0] = transforms[i].split(":")[0].trim();
            if(target.supportedDrag.indexOf(target.dragY[i][0]) == -1) throw  new Error("<nui-draggable> Check the parameters: unimplemented drag-y: expecting (transform: multiplier, transform2: multiplier2...) - Transform can be one of: ["+target.supportedDrag+"]");
            target.dragFunctionY[i] = target.prototypeFunctions[target.supportedDrag.indexOf(target.dragY[i][0])];
            // use multiplier, if present (negative reverses):
            if(transforms[i].split(":").length > 1)
                target.dragY[i][1] = parseFloat(transforms[i].split(":")[1])
            else
            	target.dragY[i][1] = 1.0;
        }
    }

    if(config.nuiEaseTime != null)
        target.easeTime = parseInt(config.nuiEaseTime);

    // A basic (named) easing = a String:
    if(config.nuiEaseType != null)
        target.easeType = config.nuiEaseType;

    // An Array means step, custom spring, or bezier easing. Overrides a basic easeType:
    if(config.nuiEaseFunction != null)
    	target.easeType = config.nuiEaseFunction.split(",").map(function(p) { return Number(p) });

    if(config.nuiFriction !=null)
        target.friction = parseFloat(config.nuiFriction);
    if(target.friction <= 0) throw new Error("<nui-draggable> Check the parameter: friction = '"+target.friction+"'. Expecting friction > 0.0");

    return (target);
}



