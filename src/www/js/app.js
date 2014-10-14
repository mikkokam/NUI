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
    nuiWorld.destroy();

    $scope.blocks = [];
    for(var i=0; i < 10; i++){
        $scope.blocks.push({"x": i * 40 + 'px', "y": '50%'})
    }

})
.controller('ListController', function($scope, nuiWorld) {
    // Clean up. This proto version of nui-box2d needs a hack to reset the world:
    nuiWorld.destroy();
    $scope.blocks = [];
    for(var i=0; i < 5; i++){
        $scope.blocks.push({"x": i})
    }

});