/**
 * @module Starter
 * @name starter
 * @description A sample Ionic app using NUI.
 *
 */


angular.module('starter', ['ionic', 'nui.ionic', 'nui.ionic.box2d'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

// Demos
.controller('Box2DController', function($scope, nuiWorld) {
    // Clean up. This proto version of nui-box2d needs a hack to reset the world:
    nuiWorld.reset();

    $scope.blocks = [];

    // just feeding in parameters for a regular div:
    for(var i=1; i < 10; i++){
        $scope.blocks.push({"shape": "box", "x": i * 10 + '%', "y": '20%', "width": "45px", "height": "45px"})
    }
    for(var i=1; i < 7; i++){
        $scope.blocks.push({"shape": "circle", "x": i * 15 + '%', "y": '10%', "width": "30px", "height": "30px"})
    }

    $scope.makeStyle = function(block){
        var br = (block.shape == "circle") ? block.width : 0;
        return({
            "width": block.width,
            "height": block.height,
            "border-radius": br
        });
    }

})
.controller('ListController', function($scope, nuiWorld) {
    // Clean up. This proto version of nui-box2d needs a hack to reset the world:
    nuiWorld.reset();
    $scope.blocks = [];
    for(var i=0; i < 5; i++){
        $scope.blocks.push({"x": i})
    }

});